import { WebSocket, WebSocketServer } from "ws";
import { IncomingMessage } from "http";
import ClientComponent from "../ClientComponent";
import { EcsManager, Entity } from "../../core";
import ClientHandler from "./ClientHandler";
import NetworkSystem from "../NetworkSystem";
import Message from "../Message";
import Component, { ComponentClass } from "../../core/Component";
import { SerializableComponent } from "../../io";
import NetworkComponent from "../NetworkComponent";

type ClientHandlerConstructor = new (
    ecsManager: EcsManager,
    webSocket: WebSocket
) => ClientHandler;

/**
 * This class is responsible for managing all the clients connected to the server.
 */
export default class ServerNetworkSystem extends NetworkSystem {
    #webSocketServer?: WebSocketServer;

    #clientHandlers: ClientHandler[];

    readonly #ClientHandlerConstructor: ClientHandlerConstructor;

    public constructor(
        allowedNetworkComponents: ComponentClass[],
        clientHandlerConstructor: ClientHandlerConstructor
    ) {
        super(allowedNetworkComponents);

        this.#ClientHandlerConstructor = clientHandlerConstructor;
        this.#clientHandlers = [];
    }

    public async onStart(): Promise<void> {
        this.#webSocketServer = new WebSocketServer({
            port: 10025,
            perMessageDeflate: {
                zlibDeflateOptions: {
                    chunkSize: 1024,
                    memLevel: 7,
                    level: 3,
                },
                zlibInflateOptions: {
                    chunkSize: 10 * 1024,
                },
                clientNoContextTakeover: true,
                serverNoContextTakeover: true,
                serverMaxWindowBits: 10,
                concurrencyLimit: 10,
                threshold: 1024,
            },
        });

        console.log("Listening for connections...");
        this.#webSocketServer.on(
            "connection",
            (webSocket, request: IncomingMessage) => {
                console.log(`New connection : ${request.socket.remoteAddress}`);
                const clientHandler = new this.#ClientHandlerConstructor(
                    this.ecsManager!,
                    webSocket
                );
                this.#clientHandlers.push(clientHandler);
                clientHandler.onConnect();
            }
        );
    }

    public onEntityEligible(
        entity: Entity,
        lastComponentAdded: Component | undefined
    ) {}

    protected onLoop(entities: Entity[], deltaTime: number): void {
        const message = new Message();

        const clientsEntity = Entity.findAllByComponent(
            this.ecsManager!,
            ClientComponent
        );

        entities.forEach((entity) => {
            if (!this.ecsManager) {
                console.warn("This system is not attached to an ECS manager");
                return;
            }

            const networkComponents: NetworkComponent<any>[] = entity
                .getComponents<SerializableComponent<any>>(this.filter)
                .filter(
                    (ComponentClass) =>
                        ComponentClass &&
                        ComponentClass instanceof NetworkComponent
                ) as NetworkComponent<any>[];

            if (networkComponents.length === 0) {
                return;
            }

            const serializedEntity = { id: entity.id, components: [] };

            networkComponents.forEach((serializableComponent) => {
                if (serializableComponent?.isClientScoped) {
                    clientsEntity.forEach((clientEntity) => {
                        if (
                            serializableComponent?.shouldUpdateClient(
                                clientEntity
                            )
                        ) {
                            this.writeComponent(
                                serializedEntity,
                                serializableComponent
                            );
                        }
                    });
                } else if (serializableComponent?.shouldUpdateClients()) {
                    this.writeComponent(
                        serializedEntity,
                        serializableComponent
                    );
                }
            });

            if (serializedEntity.components.length !== 0) {
                message.sharedMessageData.entities.push(serializedEntity);
            }
        });

        this.#clientHandlers.forEach((clientHandler) => {
            clientHandler.sendMessage(message);
        });
    }
}
