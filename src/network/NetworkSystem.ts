import { Entity, System } from "../core";
import { SerializedEntity } from "../io";
import type {
    ComponentClass,
    ComponentClassConstructor,
} from "../core/Component";
import Component from "../core/Component";
import GameState from "./GameState";
import NetworkComponent, {
    SerializedNetworkComponent,
} from "./NetworkComponent";
import NetworkEntity from "./NetworkEntity";
import IsNetworked from "./IsNetworked";
import IsPrefab from "../utils/prefabs/IsPrefab";

/**
 * The networking system is responsible for sending and receiving entities over the networking.
 * This class is used by the server and the client to provide a common interface for formatting entities.
 */
export default class NetworkSystem extends System<[IsNetworked]> {
    #previousSnapshots: GameState[];

    protected $currentSnapshot: GameState;

    $allowedNetworkComponents: ComponentClass<Component>[];

    public constructor(
        allowedNetworkComponents: ComponentClass[],
        tps?: number
    ) {
        super([IsNetworked], tps);

        this.$allowedNetworkComponents = [
            ...allowedNetworkComponents,
            IsNetworked,
        ];
        this.#previousSnapshots = [];
        this.$currentSnapshot = new GameState();
    }

    protected onLoop(
        components: [IsNetworked][],
        entities: Entity[],
        deltaTime: number
    ): void {}

    /**
     * Deserialize the components of the serialized entity and add them to the target entity.
     * @param serializedEntity
     */
    protected deserializeEntity(serializedEntity: NetworkEntity) {
        const targetEntity = this.ecsManager?.entities.find(
            (entity) => entity.id === serializedEntity.id
        );

        if (!targetEntity) {
            console.warn(
                `Received entity with id ${serializedEntity.id} but it doesn't exist`
            );
            return;
        }

        if (serializedEntity.destroyed) {
            targetEntity.destroy();
            return;
        }

        serializedEntity.components.forEach((networkComponent) =>
            this.deserializeComponent(networkComponent, targetEntity)
        );
    }

    protected deserializeComponent(
        serializedNetworkComponent: SerializedNetworkComponent<any>,
        targetEntity: Entity
    ) {
        const ComponentConstructor = this.$allowedNetworkComponents.find(
            (ComponentClass) =>
                ComponentClass.name === serializedNetworkComponent.className
        ) as ComponentClassConstructor;

        if (!ComponentConstructor) {
            console.warn(
                `Received unknown component from server ${JSON.stringify(
                    serializedNetworkComponent
                )}`
            );
            return;
        }

        let component = targetEntity.getComponent(
            ComponentConstructor
        ) as NetworkComponent<any>;

        if (!component) {
            component = new ComponentConstructor();
            targetEntity.addComponent(component);
        }

        if (
            serializedNetworkComponent.updateTimestamp > 0 &&
            component.updateTimestamp
        ) {
            // If the component is older than the last update, ignore it
            // Clients should check if the server component match with the old state of the entity
            // If it doesn't match, the client should roll back the entity to this state
            if (
                serializedNetworkComponent.updateTimestamp <=
                component.updateTimestamp
            ) {
                // this.isOutOfSync(
                //     this.#previousSnapshots[0],
                //     serializedEntity,
                //     networkComponent
                // );
                return;
            }
        }

        component.deserialize(serializedNetworkComponent);
    }

    protected serializeEntity(entity: Entity): NetworkEntity | undefined {
        const serializedEntity = new NetworkEntity(
            entity.id,
            new Map(),
            entity.name,
            entity.getComponent(IsPrefab)?.prefabName
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

    /**
     *
     * @param snapshot
     * @param entity
     * @param component
     */
    public isOutOfSync(
        snapshot: GameState,
        entity: SerializedEntity,
        component: SerializedNetworkComponent<any>
    ): boolean {
        if (!component.updateTimestamp) {
            return false;
        }

        // Find the closest snapshot
        const closestSnapshot = this.#previousSnapshots.find(
            (snapshot) => snapshot.timestamp < component.updateTimestamp!
        );
        return true;
    }

    public get allowedNetworkComponents(): ComponentClass[] {
        return this.$allowedNetworkComponents;
    }
}
