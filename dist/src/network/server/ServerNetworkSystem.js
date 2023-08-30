import { WebSocketServer } from "ws";
import ClientComponent from "../ClientComponent";
import NetworkSystem from "../NetworkSystem";
import GameState from "../GameState";
/**
 * This class is responsible for managing all the clients connected to the server.
 */
export default class ServerNetworkSystem extends NetworkSystem {
    #webSocketServer;
    $clientHandlers;
    #ClientHandlerConstructor;
    #previousSnapshots;
    constructor(allowedNetworkComponents, clientHandlerConstructor, tps) {
        super(allowedNetworkComponents, tps);
        this.#ClientHandlerConstructor = clientHandlerConstructor;
        this.$clientHandlers = [];
        this.#previousSnapshots = [];
    }
    async onStart() {
        this.#webSocketServer = new WebSocketServer({
            port: 8080,
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
        console.log("Listening for connections... ");
        this.#webSocketServer.on("connection", (webSocket, request) => {
            console.log(`New connection : ${request.socket.remoteAddress}`);
            const clientEntity = this.ecsManager.createEntity();
            clientEntity.addComponent(new ClientComponent());
            const clientHandler = new this.#ClientHandlerConstructor(clientEntity, this.ecsManager, webSocket);
            this.$clientHandlers.push(clientHandler);
            clientHandler.onConnect();
            clientHandler.sendCustomData({
                setup: {
                    clientId: clientHandler.clientEntity.id,
                },
            });
            webSocket.on("close", () => {
                console.log(`Connection closed : ${request.socket.remoteAddress}`);
                const clientHandler = this.$clientHandlers.find((clientHandler) => clientHandler.webSocket === webSocket);
                if (clientHandler) {
                    clientHandler.onDisconnect();
                    this.$clientHandlers.splice(this.$clientHandlers.indexOf(clientHandler), 1);
                }
            });
        });
    }
    async onStop() {
        this.#webSocketServer?.close();
    }
    onEntityEligible(entity, components) {
        // TODO: The delta game state shoud be a class field and this method should add the entity to it.
    }
    onEntityNoLongerEligible(entity, components) {
        const networkEntity = this.$currentSnapshot.entities.get(entity.id);
        if (networkEntity) {
            networkEntity.destroyed = true;
            this.$currentSnapshot.entities.set(entity.id, networkEntity);
        }
    }
    onLoop(components, entities, deltaTime) {
        // Process clients entities
        this.$clientHandlers.forEach((clientHandler) => {
            clientHandler.clientSnapshot?.entities.forEach((serializedEntity) => {
                this.deserializeEntity(serializedEntity);
            });
            clientHandler.clientSnapshot?.customData.forEach((data) => {
                clientHandler.onPrivateCustomData(data);
            });
            clientHandler.clientSnapshot = undefined;
        });
        const deltaGameState = new GameState();
        // Add latest destroyed entities to the delta game state
        this.$currentSnapshot.entities.forEach((networkEntity) => {
            if (networkEntity.destroyed) {
                deltaGameState.entities.set(networkEntity.id, networkEntity);
                this.$currentSnapshot.entities.delete(networkEntity.id);
            }
        });
        entities.forEach((entity) => {
            const serializedEntity = this.serializeEntity(entity);
            if (serializedEntity) {
                deltaGameState.entities.set(serializedEntity.id, serializedEntity);
                const currentSnapshotEntity = this.$currentSnapshot.entities.get(serializedEntity.id);
                if (!currentSnapshotEntity) {
                    this.$currentSnapshot.entities.set(serializedEntity.id, serializedEntity);
                    return;
                }
                serializedEntity.components.forEach((networkComponent) => {
                    currentSnapshotEntity.components.set(networkComponent.className, networkComponent);
                });
            }
        });
        this.$clientHandlers.forEach((clientHandler) => {
            deltaGameState.customData.push(...clientHandler.customData);
            if (clientHandler.forceUpdate) {
                this.$currentSnapshot.customData = clientHandler.customData;
                clientHandler.sendMessage(this.$currentSnapshot);
                this.$currentSnapshot.customData = [];
            }
            else if (deltaGameState.customData.length > 0 ||
                deltaGameState.entities.size > 0) {
                clientHandler.sendMessage(deltaGameState);
            }
            deltaGameState.customData.length = 0;
            clientHandler.customData.length = 0;
            clientHandler.forceUpdate = false;
        });
    }
    deserializeComponent(networkComponent, targetEntity) {
        const ComponentConstructor = this.$allowedNetworkComponents.find((ComponentClass) => ComponentClass.name === networkComponent.className);
        const component = targetEntity.getComponent(ComponentConstructor);
        if (component?.accept(networkComponent.data)) {
            super.deserializeComponent(networkComponent, targetEntity);
            // Update all clients
            component.forceUpdate = true;
        }
    }
    /**
     * Broadcasts custom data to all clients.
     * @param data
     */
    broadcastCustomData(data) {
        this.$clientHandlers.forEach((clientHandler) => {
            clientHandler.sendCustomData(data);
        });
    }
    sendCustomDataToClient(clientId, data) {
        const clientHandler = this.$clientHandlers.find((clientHandler) => clientHandler.clientEntity.id === clientId);
        if (clientHandler) {
            clientHandler.sendCustomData(data);
        }
        else {
            console.warn(`Client ${clientId} not found. Cannot send custom data.`);
        }
    }
}
