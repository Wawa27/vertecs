import type { ComponentClass } from "../../core/Component";
import Entity from "../../core/Entity";
import GameState from "../GameState";
import NetworkSystem from "../NetworkSystem";
import NetworkEntity from "../NetworkEntity";
import IsNetworked from "../IsNetworked";
import PrefabManager from "../../utils/prefabs/PrefabManager";

/**
 * Entry point for the client-side networking.
 * This system is responsible for sending and receiving entities over the networking.
 * It must be extended to provide a custom listener for various events.
 */
export default abstract class ClientNetworkSystem extends NetworkSystem {
    #webSocket?: WebSocket;

    protected $serverSnapshot?: GameState;

    #address: string;

    #connected;

    #networkId?: string;

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
                if (this.$serverSnapshot) {
                    console.warn("Too many messages from server");
                    return;
                }

                this.$serverSnapshot = JSON.parse(
                    event.data.toString(),
                    GameState.reviver
                );
            }
        );

        this.#webSocket.addEventListener("close", () => {
            this.#connected = false;
            this.onDisconnect();
        });
    }

    public async onStop(): Promise<void> {
        this.#webSocket?.close();
        this.onDisconnect();
    }

    public onEntityEligible(entity: Entity) {}

    protected onLoop(
        components: [IsNetworked][],
        entities: Entity[],
        deltaTime: number
    ): void {
        if (this.$serverSnapshot) {
            this.$serverSnapshot.entities.forEach((serializedEntity) => {
                this.deserializeEntity(serializedEntity);
            });

            this.$serverSnapshot.customData.forEach((data) => {
                if (data.setup) {
                    this.setup(data.setup);
                }
                this.onCustomData(data);
            });

            this.$serverSnapshot = undefined;
        }

        if (!this.#connected) {
            return;
        }

        const deltaGameState = new GameState();

        entities.forEach((entity) => {
            const networkEntity = this.serializeEntity(entity);
            if (networkEntity) {
                deltaGameState.entities.set(networkEntity.id, networkEntity);
            }
        });

        if (
            deltaGameState.entities.size === 0 &&
            this.$currentSnapshot.customData.length === 0
        ) {
            return;
        }

        deltaGameState.customData = this.$currentSnapshot.customData;

        this.$currentSnapshot.customData = [];

        this.#webSocket?.send(JSON.stringify(deltaGameState));
    }

    private setup(data: { clientId: string }) {
        this.#networkId = data.clientId;
    }

    public deserializeEntity(networkEntity: NetworkEntity): void {
        let targetEntity = this.ecsManager?.entities.find(
            (entity) => entity.id === networkEntity.id
        );

        let isNewEntity = false;

        if (!targetEntity) {
            // New entity from server
            // TODO: Use the Prefab Component instead of NetworkEntity prefabName field
            if (networkEntity.prefabName) {
                targetEntity = PrefabManager.get(
                    networkEntity.prefabName,
                    networkEntity.id
                );
                if (!targetEntity) {
                    console.warn(
                        `Received entity with id ${networkEntity.id} but prefab ${networkEntity.prefabName} doesn't exist`
                    );
                    return;
                }
                this.ecsManager?.addEntity(targetEntity);
            } else {
                targetEntity = this.ecsManager!.createEntity({
                    id: networkEntity.id,
                    name: networkEntity.name,
                });
            }
            isNewEntity = true;
        }

        if (networkEntity.destroyed) {
            this.onDeletedEntity(targetEntity);
            targetEntity.destroy();
            return;
        }

        super.deserializeEntity(networkEntity);

        if (isNewEntity) {
            this.onNewEntity(targetEntity);
        }
    }

    /**
     * Serialize the entity only if it is networked and owned by the client.
     * @param entity
     */
    public serializeEntity(entity: Entity): NetworkEntity | undefined {
        const isNetworked = entity.getComponent(IsNetworked);

        if (!isNetworked || isNetworked.ownerId !== this.#networkId) {
            return undefined;
        }

        return super.serializeEntity(entity);
    }

    public sendCustomPrivateData(data: any): void {
        this.$currentSnapshot.customData.push(data);
    }

    /**
     * Called when the client is connected to the server.
     * @protected
     */
    protected abstract onConnect(): void;

    /**
     * Called when the client is disconnected from the server.
     * @protected
     */
    protected abstract onDisconnect(): void;

    /**
     * Called when the client received a new entity from the server.
     * @protected
     */
    protected abstract onNewEntity(entity: Entity): void;

    /**
     * Called when an entity is deleted from the server.
     * @protected
     */
    protected abstract onDeletedEntity(entity: Entity): void;

    protected onCustomData(customPrivateData: any): void {}

    public get networkId(): string | undefined {
        return this.#networkId;
    }
}
