import { IncomingMessage } from "http";
import { WebSocket, WebSocketServer } from "ws";
import { EcsManager, Entity } from "../../core";
import ClientHandler from "./ClientHandler";
import NetworkSnapshot from "../NetworkSnapshot";
import type { ComponentClass } from "../../core";
import NetworkComponent, {
    SerializedNetworkComponent,
} from "../network.component";
import IsNetworked from "../is-networked.component";
import NetworkEntity from "../NetworkEntity";
import IsPrefab from "../../utils/prefabs/IsPrefab";
import type Command from "../commands/Command";
import type { SerializedCommand } from "../commands";
import CommandHandler, { CommandContext } from "../commands/CommandHandler";
import CommandRegistry from "../commands/CommandRegistry";
import SetupCommand from "../commands/SetupCommand";
import NetworkSystem from "../network.system";

type NetworkComponentSnapshot = Required<
    Pick<SerializedNetworkComponent<any>, "data" | "ownerId" | "scope">
>;

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

    readonly #gameState: NetworkSnapshot;

    readonly #commandRegistry: CommandRegistry;

    readonly #componentSnapshots: WeakMap<
        NetworkComponent<any>,
        NetworkComponentSnapshot
    >;

    readonly #port: number;

    public constructor(
        allowedNetworkComponents: ComponentClass[],
        clientHandlerConstructor: ClientHandlerConstructor,
        commandRegistry?: CommandRegistry,
        tps?: number,
        port?: number
    ) {
        super(allowedNetworkComponents, tps);

        this.#ClientHandlerConstructor = clientHandlerConstructor;
        this.$clientHandlers = [];
        this.#gameState = new NetworkSnapshot();
        this.#commandRegistry = commandRegistry ?? new CommandRegistry();
        this.#componentSnapshots = new WeakMap();
        this.#port = port ?? 8080;
    }

    public async onStart(): Promise<void> {
        this.#webSocketServer = new WebSocketServer({
            port: this.#port,
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
                clientHandler.sendCommand(
                    new SetupCommand(clientHandler.clientEntity.id)
                );

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

        const networkComponents = entity
            .getComponents(this.$allowedNetworkComponents)
            .filter(
                (component): component is NetworkComponent<any> =>
                    component instanceof NetworkComponent
            );

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
        const componentSnapshot = this.#componentSnapshots.get(component);
        const isInitialSnapshot = componentSnapshot === undefined;
        const metadataChanged =
            isInitialSnapshot ||
            componentSnapshot.ownerId !== component.ownerId ||
            componentSnapshot.scope !== component.scope;
        const isDirty = componentSnapshot
            ? component.isDirty(componentSnapshot.data)
            : true;

        if (!metadataChanged && !isDirty) {
            return undefined;
        }

        if (!isInitialSnapshot && isDirty) {
            component.updateTimestamp = Math.max(
                Date.now(),
                (component.updateTimestamp ?? -1) + 1
            );
        }

        const snapshot = component.serialize(
            isInitialSnapshot || metadataChanged
        );
        this.#componentSnapshots.set(component, {
            data: snapshot.data,
            ownerId: component.ownerId,
            scope: component.scope,
        });
        return snapshot;
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
     * Dispatches a received command to its registered handler.
     * @param serializedCommand
     * @param clientHandler The client that sent the command.
     */
    public onCommand(
        serializedCommand: SerializedCommand,
        clientHandler: ClientHandler
    ): void {
        const handler = this.#commandRegistry.get(serializedCommand.type);
        if (!handler) {
            console.warn(`Received unknown command ${serializedCommand.type}`);
            return;
        }

        const command = new handler.commandClass();
        command.deserialize(serializedCommand);

        const context: CommandContext = {
            ecsManager: this.ecsManager!,
            senderId: clientHandler.clientEntity.id,
        };

        if (handler.accept(command, context)) {
            handler.execute(command, context);
        } else {
            console.warn(`Command ${command.type} was rejected`);
        }
    }

    /**
     * Registers a command handler used to dispatch client commands.
     * @param handler
     */
    public registerCommandHandler(handler: CommandHandler<any>): void {
        this.#commandRegistry.register(handler);
    }

    /**
     * Broadcasts a command to all clients.
     * @param command
     */
    public broadcastCommand(command: Command) {
        this.$clientHandlers.forEach((clientHandler) => {
            clientHandler.sendCommand(command);
        });
    }

    public sendCommandToClient(clientId: string, command: Command) {
        const clientHandler = this.$clientHandlers.find(
            (clientHandler) => clientHandler.clientEntity.id === clientId
        );
        if (clientHandler) {
            clientHandler.sendCommand(command);
        } else {
            console.warn(`Client ${clientId} not found. Cannot send command.`);
        }
    }

    public get gameState(): NetworkSnapshot {
        return this.#gameState;
    }

    public get commandRegistry(): CommandRegistry {
        return this.#commandRegistry;
    }
}
