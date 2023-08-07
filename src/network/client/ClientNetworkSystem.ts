import type { ComponentClass } from "../../core/Component";
import Component from "../../core/Component";
import Entity from "../../core/Entity";
import GameState from "../GameState";
import NetworkSystem from "../NetworkSystem";
import NetworkComponent from "../NetworkComponent";
import NetworkEntity from "../NetworkEntity";

/**
 * Entry point for the client-side networking.
 * This system is responsible for sending and receiving entities over the networking.
 * It must be extended to provide a custom listener for various events.
 */
export default abstract class ClientNetworkSystem extends NetworkSystem {
    #webSocket?: WebSocket;

    #serverSnapshot?: GameState;

    #address: string;

    #connected;

    protected constructor(
        allowedNetworkComponents: ComponentClass[],
        address: string,
        tps?: number
    ) {
        super(allowedNetworkComponents, tps);

        this.#address = address;
        this.#connected = false;
    }

    public async onStart(): Promise<void> {
        console.log(`Connecting to server : ${this.#address} ...`);
        this.#webSocket = new WebSocket(this.#address);

        if (!this.#webSocket) {
            throw new Error("Failed to connect to server");
        }

        this.#webSocket.addEventListener("open", () => {
            console.log("Connected to server");
            this.#connected = true;
            this.onConnect();
        });

        this.#webSocket.addEventListener(
            "message",
            (event: { data: { toString: () => string } }) => {
                if (this.#serverSnapshot) {
                    console.warn("Too many messages from server");
                    return;
                }

                this.#serverSnapshot = JSON.parse(
                    event.data.toString(),
                    GameState.reviver
                );
            }
        );
    }

    public onEntityEligible(
        entity: Entity,
        lastComponentAdded: Component | undefined
    ) {}

    protected onLoop(entities: Entity[], deltaTime: number): void {
        if (this.#serverSnapshot) {
            this.#serverSnapshot.entities.forEach((serializedEntity) => {
                this.processEntity(serializedEntity, entities);
            });

            this.#serverSnapshot.customData.forEach((data) => {
                this.onCustomPrivateData(data);
            });

            this.#serverSnapshot = undefined;
        }

        if (!this.#connected) {
            return;
        }

        const deltaGameState = new GameState();

        entities.forEach((entity) => {
            const networkComponents: NetworkComponent<any>[] = entity
                .getComponents<NetworkComponent<any>>(
                    this.$allowedNetworkComponents
                )
                .filter(
                    (ComponentClass) => ComponentClass
                ) as NetworkComponent<any>[];

            if (networkComponents.length === 0) {
                return;
            }

            const networkEntity = new NetworkEntity(
                entity.id,
                new Map(),
                entity.name
            );

            // Loop through all the network components and check if they should be updated.
            // If they should be updated, serialize them and add them to the serialized entity.
            networkComponents.forEach((serializableComponent) => {
                if (serializableComponent.shouldUpdate()) {
                    networkEntity.components.set(
                        serializableComponent.constructor.name,
                        serializableComponent.serialize()
                    );
                }
            });

            if (networkEntity.components.size === 0) {
                return;
            }

            deltaGameState.entities.set(networkEntity.id, networkEntity);
        });

        if (deltaGameState.entities.size === 0) {
            return;
        }

        this.#webSocket?.send(JSON.stringify(deltaGameState));
    }

    private processEntity(
        networkEntity: NetworkEntity,
        entities: Entity[]
    ): void {
        let targetEntity = this.ecsManager?.entities.find(
            (entity) => entity.id === networkEntity.id
        );

        if (networkEntity.destroyed) {
            this.ecsManager?.destroyEntity(networkEntity.id);
        }

        let isNewEntity = false;

        if (!targetEntity) {
            // New entity from server
            targetEntity = this.ecsManager!.createEntity({
                id: networkEntity.id,
                name: networkEntity.name,
            });
            isNewEntity = true;
        }

        this.deserializeEntity(networkEntity, targetEntity);

        if (isNewEntity) {
            this.onNewEntity(targetEntity);
        }
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

    protected onCustomPrivateData(customPrivateData: any): void {}
}
