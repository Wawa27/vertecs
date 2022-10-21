import { WebSocket } from "ws";
import { Entity } from "../../core";
import Message from "../Message";
import NetworkSystem from "../NetworkSystem";
import SerializedEntity from "../SerializedEntity";

export default abstract class ClientNetworkSystem extends NetworkSystem {
    #webSocket?: WebSocket;

    #lastMessage?: Message;

    protected constructor() {
        super([]);
    }

    public async onStart(): Promise<void> {
        this.#webSocket = new WebSocket("ws://localhost:10025");

        if (!this.#webSocket) {
            throw new Error("Failed to connect to server");
        }

        this.#webSocket.on("open", () => {
            this.#webSocket?.send("Connected to server");
        });

        this.#webSocket.on("message", (data) => {
            // @ts-ignore
            this.#lastMessage = JSON.parse(data);
        });
    }

    protected onLoop(entities: Entity[], deltaTime: number): void {
        if (!this.#lastMessage) {
            return;
        }

        this.#lastMessage.sharedMessageData.entities.forEach(
            (serializedEntity) => {
                this.processEntity(serializedEntity, entities);
            }
        );

        this.#lastMessage.privateMessageData.entities.forEach(
            (serializedEntity) => {
                this.processEntity(serializedEntity, entities);
            }
        );
    }

    private processEntity(
        serializedEntity: SerializedEntity,
        entities: Entity[]
    ): void {
        let targetEntity = entities.find(
            (entity) => entity.id === serializedEntity.id
        );

        if (!targetEntity) {
            // New entity from server
            targetEntity = new Entity({ id: serializedEntity.id });
        }

        serializedEntity.readComponents(targetEntity);
    }

    /**
     * Called when the client is connected to the server.
     * @protected
     */
    protected abstract onConnect(): void;

    /**
     * Called when the client received a new entity from the server.
     * @protected
     */
    protected abstract onNewEntity(): void;
}
