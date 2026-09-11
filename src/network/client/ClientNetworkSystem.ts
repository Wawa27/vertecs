import type {
    ComponentClass,
    ComponentClassConstructor,
} from "../../core/Component";
import Entity from "../../core/Entity";
import GameState from "../GameState";
import NetworkEntity from "../NetworkEntity";
import IsNetworked from "../IsNetworked";
import PrefabManager from "../../utils/prefabs/PrefabManager";
import IsPrefab from "../../utils/prefabs/IsPrefab";
import type Command from "../commands/Command";
import type { SerializedCommand } from "../commands";
import CommandHandler, { CommandContext } from "../commands/CommandHandler";
import CommandRegistry from "../commands/CommandRegistry";
import SetupCommand from "../commands/SetupCommand";
import NetworkSystem from "../network.system";
import NetworkComponent, { SerializedNetworkComponent } from "../network.component";

/**
 * Entry point for the client-side networking.
 * This system is responsible for sending and receiving entities over the networking.
 * It must be extended to provide a custom listener for various events.
 */
export default abstract class ClientNetworkSystem extends NetworkSystem {
    #webSocket?: WebSocket;

    protected $serverSnapshot: GameState;

    protected $clientSnapshot: GameState;

    #address: string;

    #connected;

    #networkId?: string;

    readonly #commandRegistry: CommandRegistry;

    protected constructor(
        allowedNetworkComponents: ComponentClass[],
        address: string,
        commandRegistry?: CommandRegistry,
        tps?: number
    ) {
        super(allowedNetworkComponents, tps);

        this.#address = address;
        this.#connected = false;
        this.$clientSnapshot = new GameState();
        this.$serverSnapshot = new GameState();
        this.#commandRegistry = commandRegistry ?? new CommandRegistry();
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
                const snapshot = JSON.parse(
                    event.data.toString(),
                    GameState.reviver
                );
                // TODO: find a better solutions for handling packets instead of merging
                this.#mergeServerSnapshot(snapshot);
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
        if (
            this.$serverSnapshot.commands.length > 0 ||
            this.$serverSnapshot.entities.size > 0
        ) {
            this.$serverSnapshot.commands.forEach((serializedCommand) => {
                this.onCommand(serializedCommand);
            });

            this.$serverSnapshot.entities.forEach((serializedEntity) => {
                this.deserializeEntity(serializedEntity);
            });

            this.$serverSnapshot = new GameState();
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
            this.$clientSnapshot.commands.length === 0
        ) {
            return;
        }

        deltaGameState.commands = this.$clientSnapshot.commands;

        this.$clientSnapshot.commands = [];

        this.#webSocket?.send(JSON.stringify(deltaGameState));
    }

    // TODO: refactor ?
    #mergeServerSnapshot(snapshot: GameState): void {
        snapshot.commands.forEach((serializedCommand) => {
            this.$serverSnapshot.commands.push(serializedCommand);
        });

        snapshot.entities.forEach((networkEntity, id) => {
            const pendingEntity = this.$serverSnapshot.entities.get(id);
            if (!pendingEntity) {
                this.$serverSnapshot.entities.set(id, networkEntity);
                return;
            }

            if (networkEntity.isDestroyed) {
                pendingEntity.isDestroyed = true;
            }
            networkEntity.components.forEach((component, className) => {
                pendingEntity.components.set(className, component);
            });
        });
    }

    private setup(data: { clientId: string }) {
        this.#networkId = data.clientId;
        this.onSetup(data.clientId);
    }

    /**
     * Called when the client received its network id from the server.
     * @param clientId
     * @protected
     */
    protected onSetup(clientId: string): void {}

    /**
     * Dispatches a received command to its registered handler.
     * The setup command is handled internally to configure the network id.
     * @param serializedCommand
     */
    public onCommand(serializedCommand: SerializedCommand): void {
        if (serializedCommand.type === SetupCommand.TYPE) {
            const setupCommand = new SetupCommand();
            setupCommand.deserialize(serializedCommand);
            this.setup({ clientId: setupCommand.clientId });
            return;
        }

        const handler = this.#commandRegistry.get(serializedCommand.type);
        if (!handler) {
            console.warn(`Received unknown command ${serializedCommand.type}`);
            return;
        }

        const command = new handler.commandClass();
        command.deserialize(serializedCommand);

        const context: CommandContext = {
            ecsManager: this.ecsManager!,
        };

        if (handler.accept(command, context)) {
            handler.execute(command, context);
        } else {
            console.warn(`Command ${command.type} was rejected`);
        }
    }

    /**
     * Registers a command handler used to dispatch server commands.
     * @param handler
     */
    public registerCommandHandler(handler: CommandHandler<any>): void {
        this.#commandRegistry.register(handler);
    }

    public deserializeEntity(networkEntity: NetworkEntity): void {
        let targetEntity = this.ecsManager?.entities.find(
            (entity) => entity.id === networkEntity.id
        );

        let isNewEntity = false;

        if (!targetEntity) {
            // New entity from server
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
                targetEntity.name = networkEntity.name;
                this.ecsManager?.addEntity(targetEntity);
            } else {
                const parent = this.ecsManager?.entities.find(
                    (entity) => entity.id === networkEntity.parentId
                );

                if (networkEntity.parentId && !parent) {
                    console.warn(
                        "Parent not found for entity : ",
                        networkEntity.name
                    );
                }

                targetEntity = this.ecsManager!.createEntity({
                    id: networkEntity.id,
                    name: networkEntity.name,
                    parent,
                });
            }
            isNewEntity = true;
        }

        if (!targetEntity) {
            throw new Error("Target entity not found");
        }

        if (networkEntity.isDestroyed) {
            this.onDeletedEntity(targetEntity);
            targetEntity.destroy();
            return;
        }

        networkEntity.components.forEach((networkComponent) => {
            this.deserializeComponent(networkComponent, targetEntity!);
        });

        if (isNewEntity) {
            this.onNewEntity(targetEntity);
        }
    }

    private deserializeComponent(
        networkComponent: SerializedNetworkComponent<any>,
        targetEntity: Entity
    ) {
        const ComponentConstructor = this.$allowedNetworkComponents.find(
            (ComponentClass) =>
                ComponentClass.name === networkComponent.className
        ) as ComponentClassConstructor;

        if (!ComponentConstructor) {
            console.warn(
                `Received unknown component from server ${JSON.stringify(
                    networkComponent
                )}`
            );
            return;
        }

        let component = targetEntity!.getComponent(
            ComponentConstructor
        ) as NetworkComponent<any>;

        if (!component) {
            component = new ComponentConstructor();
            targetEntity!.addComponent(component);
        }

        if (networkComponent.updateTimestamp > 0 && component.updateTimestamp) {
            // If the component is older than the last update, ignore it
            // Clients should check if the server component match with the old state of the entity
            // If it doesn't match, the client should roll back the entity to this state
            if (component.updateTimestamp >= networkComponent.updateTimestamp) {
                // TODO: Out of sync resolution
                console.warn("Component is out of sync");
                return;
            }
        }

        component.deserialize(networkComponent);
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

        const networkEntity = new NetworkEntity(
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
            if (
                serializableComponent.lastData &&
                serializableComponent.isDirty(serializableComponent.lastData) &&
                (serializableComponent.ownerId === this.#networkId ||
                    serializableComponent.ownerId === "*")
            ) {
                serializableComponent.updateTimestamp = Date.now();
                const serializedData = serializableComponent.serialize();
                const componentName = serializableComponent.constructor.name;
                networkEntity.components.set(componentName, serializedData);
            }
        });

        if (networkEntity.components.size > 0) {
            return networkEntity;
        }

        return undefined;
    }

    /**
     * Sends a command to the server.
     * @param command
     */
    public sendCommand(command: Command): void {
        this.$clientSnapshot.commands.push(command.serialize());
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

    public get networkId(): string | undefined {
        return this.#networkId;
    }

    public get commandRegistry(): CommandRegistry {
        return this.#commandRegistry;
    }
}
