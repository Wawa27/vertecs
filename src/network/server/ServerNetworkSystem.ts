import { WebSocket, WebSocketServer } from "ws";
import { IncomingMessage } from "http";
import ClientComponent from "../ClientComponent";
import { EcsManager, Entity } from "../../core";
import ClientHandler from "./ClientHandler";
import NetworkSystem from "../NetworkSystem";
import GameState from "../GameState";
import type { ComponentClass } from "../../core/Component";
import Component from "../../core/Component";
import NetworkComponent from "../NetworkComponent";
import NetworkEntity from "../NetworkEntity";

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

    #clientHandlers: ClientHandler[];

    readonly #ClientHandlerConstructor: ClientHandlerConstructor;

    readonly #previousSnapshots: GameState[];

    #currentSnapshot: GameState;

    public constructor(
        allowedNetworkComponents: ComponentClass[],
        clientHandlerConstructor: ClientHandlerConstructor,
        tps?: number
    ) {
        super(allowedNetworkComponents, tps);

        this.#ClientHandlerConstructor = clientHandlerConstructor;
        this.#clientHandlers = [];
        this.#previousSnapshots = [];
        this.#currentSnapshot = new GameState();
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
                this.#clientHandlers.push(clientHandler);
                clientHandler.onConnect();

                webSocket.on("close", () => {
                    console.log(
                        `Connection closed : ${request.socket.remoteAddress}`
                    );
                    const clientHandler = this.#clientHandlers.find(
                        (clientHandler) => clientHandler.webSocket === webSocket
                    );
                    if (clientHandler) {
                        clientHandler.onDisconnect();
                        this.#clientHandlers.splice(
                            this.#clientHandlers.indexOf(clientHandler),
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
            this.#currentSnapshot.entities.get(entity.id) ??
            new NetworkEntity(entity.id, new Map());
        networkEntity.destroyed = true;
        this.#currentSnapshot.entities.set(entity.id, networkEntity);
    }

    protected onLoop(entities: Entity[], deltaTime: number): void {
        // Process clients entities
        this.#clientHandlers.forEach((clientHandler) => {
            clientHandler.clientSnapshot?.entities.forEach(
                (serializedEntity) => {
                    this.processEntity(serializedEntity, entities);
                }
            );
            clientHandler.clientSnapshot = undefined;
        });

        const deltaGameState = new GameState();

        // Add latest destroyed entities to the delta game state
        this.#currentSnapshot.entities.forEach((networkEntity) => {
            if (networkEntity.destroyed) {
                deltaGameState.entities.set(networkEntity.id, networkEntity);
                this.#currentSnapshot.entities.delete(networkEntity.id);
            }
        });

        this.ecsManager?.entities.forEach((entity) => {
            // TODO: should only send allowed components
            const networkComponents: NetworkComponent<any>[] = entity
                .getComponents<NetworkComponent<any>>(
                    this.$allowedNetworkComponents
                )
                .filter((component) => component) as NetworkComponent<any>[];

            if (networkComponents.length === 0) {
                return;
            }

            const deltaNetworkEntity = new NetworkEntity(
                entity.id,
                new Map(),
                entity.name
            );
            const networkEntity = this.$currentSnapshot.entities.get(entity.id);

            // Loop through all the network components and check if they should be updated.
            // If they should be updated, serialize them and add them to the serialized entity.
            networkComponents.forEach((serializableComponent) => {
                if (
                    !serializableComponent.shouldUpdate() &&
                    !serializableComponent.forceUpdate
                ) {
                    return;
                }

                const serializedData = serializableComponent.serialize();
                serializableComponent.forceUpdate = false;
                const componentName = serializableComponent.constructor.name;
                deltaNetworkEntity.components.set(
                    componentName,
                    serializedData
                );
                if (networkEntity) {
                    networkEntity.components.set(componentName, serializedData);
                }
            });

            if (deltaNetworkEntity.components.size > 0) {
                deltaGameState.entities.set(entity.id, deltaNetworkEntity);

                if (!networkEntity) {
                    this.$currentSnapshot.entities.set(
                        entity.id,
                        deltaNetworkEntity
                    );
                }
            }
        });

        this.#clientHandlers.forEach((clientHandler) => {
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

    private processEntity(
        serializedEntity: NetworkEntity,
        entities: Entity[]
    ): void {
        const targetEntity = this.ecsManager?.entities.find(
            (entity) => entity.id === serializedEntity.id
        );

        if (!targetEntity) {
            console.warn("Entity from client not found");
            return;
        }

        this.deserializeEntity(serializedEntity, targetEntity);
    }
}
