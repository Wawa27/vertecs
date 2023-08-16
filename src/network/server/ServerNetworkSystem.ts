import { WebSocket, WebSocketServer } from "ws";
import { IncomingMessage } from "http";
import ClientComponent from "../ClientComponent";
import { EcsManager, Entity } from "../../core";
import ClientHandler from "./ClientHandler";
import NetworkSystem from "../NetworkSystem";
import GameState from "../GameState";
import type { ComponentClass } from "../../core/Component";
import Component, { ComponentClassConstructor } from "../../core/Component";
import NetworkComponent, {
    SerializedNetworkComponent,
} from "../NetworkComponent";
import NetworkEntity from "../NetworkEntity";
import IsNetworked from "../IsNetworked";

type ClientHandlerConstructor = new (
    playerEntity: Entity,
    ecsManager: EcsManager,
    webSocket: WebSocket
) => ClientHandler;

/**
 * This class is responsible for managing all the clients connected to the server.
 */
export default class ServerNetworkSystem extends NetworkSystem {
    #webSocketServer?: WebSocketServer;

    protected $clientHandlers: ClientHandler[];

    readonly #ClientHandlerConstructor: ClientHandlerConstructor;

    readonly #previousSnapshots: GameState[];

    public constructor(
        allowedNetworkComponents: ComponentClass[],
        clientHandlerConstructor: ClientHandlerConstructor,
        tps?: number
    ) {
        super(allowedNetworkComponents, tps);

        this.#ClientHandlerConstructor = clientHandlerConstructor;
        this.$clientHandlers = [];
        this.#previousSnapshots = [];
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
                const playerEntity = this.ecsManager!.createEntity();
                playerEntity.addComponent(new ClientComponent());
                const clientHandler = new this.#ClientHandlerConstructor(
                    playerEntity,
                    this.ecsManager!,
                    webSocket
                );
                this.$clientHandlers.push(clientHandler);
                clientHandler.onConnect();
                clientHandler.sendPrivateCustomData({
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

    public onEntityEligible(
        entity: Entity,
        lastComponentAdded: Component | undefined
    ) {
        // TODO: The delta game state shoud be a class field and this method should add the entity to it.
    }

    public onEntityNoLongerEligible(
        entity: Entity,
        lastComponentRemoved: Component
    ) {
        const networkEntity =
            this.$currentSnapshot.entities.get(entity.id) ??
            new NetworkEntity(entity.id, new Map());
        networkEntity.destroyed = true;
        this.$currentSnapshot.entities.set(entity.id, networkEntity);
    }

    protected onLoop(
        components: [IsNetworked][],
        entities: Entity[],
        deltaTime: number
    ): void {
        // Process clients entities
        this.$clientHandlers.forEach((clientHandler) => {
            clientHandler.clientSnapshot?.entities.forEach(
                (serializedEntity) => {
                    this.deserializeEntity(serializedEntity);
                }
            );
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
                deltaGameState.entities.set(
                    serializedEntity.id,
                    serializedEntity
                );

                const currentSnapshotEntity =
                    this.$currentSnapshot.entities.get(serializedEntity.id);

                if (!currentSnapshotEntity) {
                    this.$currentSnapshot.entities.set(
                        serializedEntity.id,
                        serializedEntity
                    );
                    return;
                }

                serializedEntity.components.forEach((networkComponent) => {
                    currentSnapshotEntity.components.set(
                        networkComponent.className,
                        networkComponent
                    );
                });
            }
        });

        this.$clientHandlers.forEach((clientHandler) => {
            if (clientHandler.forceUpdate) {
                this.$currentSnapshot.customData = clientHandler.privateData;
                clientHandler.sendMessage(this.$currentSnapshot);
                this.$currentSnapshot.customData = [];
            } else if (
                deltaGameState.customData.length > 0 ||
                deltaGameState.entities.size > 0
            ) {
                deltaGameState.customData = clientHandler.privateData;
                clientHandler.sendMessage(deltaGameState);
                deltaGameState.customData = [];
            }
            clientHandler.privateData.length = 0;
            clientHandler.forceUpdate = false;
        });
    }

    public deserializeComponent(
        networkComponent: SerializedNetworkComponent<any>,
        targetEntity: Entity
    ) {
        const ComponentConstructor = this.$allowedNetworkComponents.find(
            (ComponentClass) =>
                ComponentClass.name === networkComponent.className
        ) as ComponentClassConstructor;

        const component =
            targetEntity.getComponent<NetworkComponent<any>>(
                ComponentConstructor
            );

        if (component?.accept(networkComponent.data)) {
            super.deserializeComponent(networkComponent, targetEntity);

            // Update all clients
            component.forceUpdate = true;
        }
    }
}
