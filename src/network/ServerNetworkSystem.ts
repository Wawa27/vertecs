import { WebSocket, WebSocketServer } from "ws";
import { IncomingMessage } from "http";
import NetworkableComponent from "./NetworkableComponent";
import NetworkSystem from "./NetworkSystem";
import ClientHandler from "./ClientHandler";
import { EcsManager, Entity } from "../core";
import Component, { ComponentClass } from "../core/Component";
import Message from "./Message";
import ClientComponent from "./ClientComponent";

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
        super([NetworkableComponent]);

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
            const networkableComponents = entity
                .getComponents<NetworkableComponent<any>>(
                    NetworkSystem.allowedNetworkComponents
                )
                .filter((component) => component);

            if (networkableComponents.length === 0) {
                return;
            }

            const serializedEntity = { id: entity.id, components: [] };

            networkableComponents.forEach((networkableComponent) => {
                if (networkableComponent?.isClientScoped) {
                    clientsEntity.forEach((clientEntity) => {
                        if (
                            networkableComponent?.shouldUpdateClient(
                                clientEntity
                            )
                        ) {
                            this.writeComponent(
                                serializedEntity,
                                networkableComponent
                            );
                        }
                    });
                } else if (networkableComponent?.shouldUpdateClients()) {
                    this.writeComponent(serializedEntity, networkableComponent);
                }
            });

            message.sharedMessageData.entities.push(serializedEntity);
        });

        this.#clientHandlers.forEach((clientHandler) => {
            clientHandler.sendMessage(message);
        });
    }
}
