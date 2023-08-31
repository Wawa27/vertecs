import GameState from "../GameState";
import NetworkSystem from "../NetworkSystem";
import IsNetworked from "../IsNetworked";
import PrefabManager from "../../utils/prefabs/PrefabManager";
/**
 * Entry point for the client-side networking.
 * This system is responsible for sending and receiving entities over the networking.
 * It must be extended to provide a custom listener for various events.
 */
export default class ClientNetworkSystem extends NetworkSystem {
    #webSocket;
    $serverSnapshot;
    #address;
    #connected;
    #networkId;
    constructor(allowedNetworkComponents, address, tps) {
        super(allowedNetworkComponents, tps);
        this.#address = address;
        this.#connected = false;
    }
    async onStart() {
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
        this.#webSocket.addEventListener("message", (event) => {
            if (this.$serverSnapshot) {
                console.warn("Too many messages from server");
                return;
            }
            this.$serverSnapshot = JSON.parse(event.data.toString(), GameState.reviver);
        });
        this.#webSocket.addEventListener("close", () => {
            this.#connected = false;
            this.onDisconnect();
        });
    }
    async onStop() {
        this.#webSocket?.close();
        this.onDisconnect();
    }
    onEntityEligible(entity) { }
    onLoop(components, entities, deltaTime) {
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
        if (deltaGameState.entities.size === 0 &&
            this.$currentSnapshot.customData.length === 0) {
            return;
        }
        deltaGameState.customData = this.$currentSnapshot.customData;
        this.$currentSnapshot.customData = [];
        this.#webSocket?.send(JSON.stringify(deltaGameState));
    }
    setup(data) {
        this.#networkId = data.clientId;
    }
    deserializeEntity(networkEntity) {
        let targetEntity = this.ecsManager?.entities.find((entity) => entity.id === networkEntity.id);
        let isNewEntity = false;
        if (!targetEntity) {
            // New entity from server
            // TODO: Use the Prefab Component instead of NetworkEntity prefabName field
            if (networkEntity.prefabName) {
                targetEntity = PrefabManager.get(networkEntity.prefabName, networkEntity.id);
                if (!targetEntity) {
                    console.warn(`Received entity with id ${networkEntity.id} but prefab ${networkEntity.prefabName} doesn't exist`);
                    return;
                }
                this.ecsManager?.addEntity(targetEntity);
            }
            else {
                targetEntity = this.ecsManager.createEntity({
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
    serializeEntity(entity) {
        const isNetworked = entity.getComponent(IsNetworked);
        if (!isNetworked || isNetworked.ownerId !== this.#networkId) {
            return undefined;
        }
        return super.serializeEntity(entity);
    }
    sendCustomPrivateData(data) {
        this.$currentSnapshot.customData.push(data);
    }
    onCustomData(customPrivateData) { }
    get networkId() {
        return this.#networkId;
    }
}
