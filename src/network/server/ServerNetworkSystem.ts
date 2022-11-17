import { WebSocket, WebSocketServer } from "ws";
import { Entity } from "../../core";
import ClientHandler from "./ClientHandler";
import SerializableComponent from "../SerializableComponent";
import NetworkSystem from "../NetworkSystem";
import Message from "../Message";
import Component, { ComponentClass } from "../../core/Component";

type ClientHandlerConstructor = new (webSocket: WebSocket) => ClientHandler;

/**
 * This class is responsible for managing all the clients connected to the server.
 */
export default class ServerNetworkSystem extends NetworkSystem {
    #webSocketServer?: WebSocketServer;

    #clientHandlers: ClientHandler[];

    readonly #ClientHandlerConstructor: ClientHandlerConstructor;

    public constructor(
        allowedNetworkComponents: ComponentClass[],
        clientHandlerConstructor: new (webSocket: WebSocket) => ClientHandler
    ) {
        super([SerializableComponent]);

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

        console.log("Listening for connections");
        this.#webSocketServer.on("connection", (webSocket) => {
            console.log(`New connection : ${webSocket.url}`);
            const clientHandler = new this.#ClientHandlerConstructor(webSocket);
            this.#clientHandlers.push(clientHandler);
            clientHandler.onConnect();
        });
    }

    public onEntityEligible(
        entity: Entity,
        lastComponentAdded: Component | undefined
    ) {
        console.debug("Entity eligible for network");
    }

    protected onLoop(entities: Entity[], deltaTime: number): void {
        const message = new Message();
        entities.forEach((entity) => {
            let serializableComponents = entity.getComponents<
                SerializableComponent<any>
            >(NetworkSystem.allowedNetworkComponents);

            serializableComponents = serializableComponents.filter(
                (component) => component
            );

            if (serializableComponents.length === 0) {
                return;
            }

            const serializedEntity = { id: entity.id, components: [] };

            serializableComponents.forEach((serializableComponent) => {
                if (serializableComponent?.isDirty()) {
                    this.writeComponent(
                        serializedEntity,
                        serializableComponent
                    );
                }
            });

            message.sharedMessageData.entities.push(serializedEntity);
        });

        this.#clientHandlers.forEach((clientHandler) => {
            clientHandler.sendMessage(message);
        });
    }
}
