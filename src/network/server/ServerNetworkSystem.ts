import { IncomingMessage } from "http";
import { WebSocket, WebSocketServer } from "ws";
import { EcsManager, Entity } from "../../core";
import ClientHandler from "./ClientHandler";
import NetworkSystem from "../NetworkSystem";
import GameState from "../GameState";
import type { ComponentClass } from "../../core/Component";
import NetworkComponent, {
    SerializedNetworkComponent,
} from "../NetworkComponent";
import IsNetworked from "../IsNetworked";
import NetworkEntity from "../NetworkEntity";
import IsPrefab from "../../utils/prefabs/IsPrefab";

type ClientHandlerConstructor = new (
    ecsManager: EcsManager,
    webSocket: WebSocket,
    serverNetworkSystem: ServerNetworkSystem
) => ClientHandler;

/**
 * This class is responsible for managing all the clients connected to the server.
 */
export default class ServerNetworkSystem extends NetworkSystem {
    #webSocketServer?: WebSocketServer;

    protected $clientHandlers: ClientHandler[];

    readonly #ClientHandlerConstructor: ClientHandlerConstructor;

    readonly #gameState: GameState;

    public constructor(
        allowedNetworkComponents: ComponentClass[],
        clientHandlerConstructor: ClientHandlerConstructor,
        tps?: number
    ) {
        super(allowedNetworkComponents, tps);

        this.#ClientHandlerConstructor = clientHandlerConstructor;
        this.$clientHandlers = [];
        this.#gameState = new GameState();
    }

    public async onStart(): Promise<void> {
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
        this.#webSocketServer.on(
            "connection",
            (webSocket, request: IncomingMessage) => {
                console.log(`New connection : ${request.socket.remoteAddress}`);
                const clientHandler = new this.#ClientHandlerConstructor(
                    this.ecsManager!,
                    webSocket,
                    this
                );
                this.$clientHandlers.push(clientHandler);
                clientHandler.onConnect();
                clientHandler.sendCustomData({
                    setup: {
                        clientId: clientHandler.clientEntity.id,
                    },
                });

                webSocket.on("close", () => {
                    console.log(
                        `Connection closed : ${request.socket.remoteAddress}`
                    );
                    const clientHandler = this.$clientHandlers.find(
                        (clientHandler) => clientHandler.webSocket === webSocket
                    );
                    if (clientHandler) {
                        clientHandler.onDisconnect();
                        this.$clientHandlers.splice(
                            this.$clientHandlers.indexOf(clientHandler),
                            1
                        );
                    }
                });
            }
        );
    }

    public async onStop(): Promise<void> {
        this.#webSocketServer?.close();
    }

    public onEntityEligible(entity: Entity, components: [IsNetworked]) {}

    public onEntityNoLongerEligible(entity: Entity, components: [IsNetworked]) {
        const networkEntity = this.#gameState.entities.get(entity.id);

        if (networkEntity) {
            networkEntity.isDestroyed = true;
            this.$clientHandlers.forEach((clientHandler) =>
                clientHandler.sendEntity(networkEntity)
            );
        }
    }

    protected serializeEntity(entity: Entity): NetworkEntity | undefined {
        const serializedEntity = new NetworkEntity(
            entity.id,
            new Map(),
            false,
            entity.tags,
            entity.getComponent(IsPrefab)?.prefabName,
            entity.name,
            entity.parent?.id
        );

        const networkComponents: NetworkComponent<any>[] = entity
            .getComponents(this.$allowedNetworkComponents)
            .filter((component) => component) as NetworkComponent<any>[];

        if (networkComponents.length === 0) {
            return undefined;
        }

        // Loop through all the network components and check if they should be updated.
        // If they should be updated, serialize them and add them to the serialized entity.
        networkComponents.forEach((serializableComponent) => {
            const serializedData = this.serializeComponent(
                serializableComponent
            );
            if (serializedData) {
                const componentName = serializableComponent.constructor.name;
                serializedEntity.components.set(componentName, serializedData);
            }
        });

        if (serializedEntity.components.size > 0) {
            return serializedEntity;
        }

        return undefined;
    }

    protected serializeComponent(
        component: NetworkComponent<any>
    ): SerializedNetworkComponent<any> | undefined {
        if (component.forceUpdate) {
            return component.serialize(true);
        }
        if (component.isDirty(component.lastData)) {
            component.updateTimestamp = Date.now();
            return component.serialize();
        }
        return undefined;
    }

    protected onLoop(
        components: [IsNetworked][],
        entities: Entity[],
        deltaTime: number
    ): void {
        // Process clients entities
        this.$clientHandlers.forEach((clientHandler) => {
            clientHandler.processClientSnapshot();
        });

        // Add latest destroyed entities to the delta game state
        this.#gameState.entities.forEach((networkEntity) => {
            if (networkEntity.isDestroyed) {
                this.$clientHandlers.forEach((clientHandler) => {
                    clientHandler.sendEntity(networkEntity);
                });
                this.#gameState.entities.delete(networkEntity.id);
            }
        });

        entities.forEach((entity) => {
            const serializedEntity = this.serializeEntity(entity);

            if (serializedEntity) {
                this.$clientHandlers.forEach((clientHandler) => {
                    clientHandler.sendEntity(serializedEntity);
                });

                // Update game state
                const currentSnapshotEntity = this.#gameState.entities.get(
                    serializedEntity.id
                );
                if (!currentSnapshotEntity) {
                    this.#gameState.entities.set(
                        serializedEntity.id,
                        serializedEntity
                    );
                } else {
                    serializedEntity.components.forEach((networkComponent) => {
                        currentSnapshotEntity.components.set(
                            networkComponent.className,
                            networkComponent
                        );
                    });
                }
            }
        });

        this.$clientHandlers.forEach((clientHandler) => {
            clientHandler.updateClient();
        });
    }

    /**
     * Broadcasts custom data to all clients.
     * @param data
     */
    public broadcastCustomData(data: any) {
        this.$clientHandlers.forEach((clientHandler) => {
            clientHandler.sendCustomData(data);
        });
    }

    public sendCustomDataToClient(clientId: string, data: any) {
        const clientHandler = this.$clientHandlers.find(
            (clientHandler) => clientHandler.clientEntity.id === clientId
        );
        if (clientHandler) {
            clientHandler.sendCustomData(data);
        } else {
            console.warn(
                `Client ${clientId} not found. Cannot send custom data.`
            );
        }
    }

    public get gameState(): GameState {
        return this.#gameState;
    }
}
