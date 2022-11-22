import { WebSocket } from "ws";
import { ComponentClass } from "../../core/Component";
import Entity from "../../core/Entity";
import Message from "../Message";
import NetworkSystem from "../NetworkSystem";
import { SerializedEntity } from "../SerializedEntity";

/**
 * Entry point for the client-side network.
 * This system is responsible for sending and receiving entities over the network.
 * It must be extended to provide a custom listener for various events.
 */
export default abstract class ClientNetworkSystem extends NetworkSystem {
    #webSocket?: WebSocket;

    #lastMessage?: Message;

    #address: string;

    protected constructor(
        allowedNetworkComponents: ComponentClass[],
        address: string
    ) {
        super(allowedNetworkComponents);

        this.#address = address;
    }

    public async onStart(): Promise<void> {
        console.log(`Connecting to server : ${this.#address} ...`);
        this.#webSocket = new WebSocket(this.#address);

        if (!this.#webSocket) {
            throw new Error("Failed to connect to server");
        }

        this.#webSocket.on("open", () => {
            console.log("Connected to server");
            this.onConnect();
        });

        this.#webSocket.on("message", (data) => {
            this.#lastMessage = JSON.parse(data.toString());
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
            this.ecsManager!.addEntity(targetEntity);
            this.onNewEntity(targetEntity);
        }

        this.readComponents(serializedEntity, targetEntity);
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
    protected abstract onNewEntity(entity: Entity): void;
}
