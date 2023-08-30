import { System } from "../core";
import GameState from "./GameState";
import NetworkEntity from "./NetworkEntity";
import IsNetworked from "./IsNetworked";
import IsPrefab from "../utils/prefabs/IsPrefab";
/**
 * The networking system is responsible for sending and receiving entities over the networking.
 * This class is used by the server and the client to provide a common interface for formatting entities.
 */
export default class NetworkSystem extends System {
    #previousSnapshots;
    $currentSnapshot;
    $allowedNetworkComponents;
    constructor(allowedNetworkComponents, tps) {
        super([IsNetworked], tps);
        this.$allowedNetworkComponents = [
            ...allowedNetworkComponents,
            IsNetworked,
        ];
        this.#previousSnapshots = [];
        this.$currentSnapshot = new GameState();
    }
    onLoop(components, entities, deltaTime) { }
    /**
     * Deserialize the components of the serialized entity and add them to the target entity.
     * @param serializedEntity
     */
    deserializeEntity(serializedEntity) {
        const targetEntity = this.ecsManager?.entities.find((entity) => entity.id === serializedEntity.id);
        if (!targetEntity) {
            console.warn(`Received entity with id ${serializedEntity.id} but it doesn't exist`);
            return;
        }
        if (serializedEntity.destroyed) {
            targetEntity.destroy();
            return;
        }
        serializedEntity.components.forEach((networkComponent) => this.deserializeComponent(networkComponent, targetEntity));
    }
    deserializeComponent(serializedNetworkComponent, targetEntity) {
        const ComponentConstructor = this.$allowedNetworkComponents.find((ComponentClass) => ComponentClass.name === serializedNetworkComponent.className);
        if (!ComponentConstructor) {
            console.warn(`Received unknown component from server ${JSON.stringify(serializedNetworkComponent)}`);
            return;
        }
        let component = targetEntity.getComponent(ComponentConstructor);
        if (!component) {
            component = new ComponentConstructor();
            targetEntity.addComponent(component);
        }
        if (serializedNetworkComponent.updateTimestamp > 0 &&
            component.updateTimestamp) {
            // If the component is older than the last update, ignore it
            // Clients should check if the server component match with the old state of the entity
            // If it doesn't match, the client should roll back the entity to this state
            if (serializedNetworkComponent.updateTimestamp <=
                component.updateTimestamp) {
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
    serializeEntity(entity) {
        const serializedEntity = new NetworkEntity(entity.id, new Map(), entity.name, entity.getComponent(IsPrefab)?.prefabName);
        const networkComponents = entity
            .getComponents(this.$allowedNetworkComponents)
            .filter((component) => component);
        if (networkComponents.length === 0) {
            return undefined;
        }
        // Loop through all the network components and check if they should be updated.
        // If they should be updated, serialize them and add them to the serialized entity.
        networkComponents.forEach((serializableComponent) => {
            const serializedData = this.serializeComponent(serializableComponent);
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
    serializeComponent(component) {
        if (component.forceUpdate) {
            return component.serialize();
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
    isOutOfSync(snapshot, entity, component) {
        if (!component.updateTimestamp) {
            return false;
        }
        // Find the closest snapshot
        const closestSnapshot = this.#previousSnapshots.find((snapshot) => snapshot.timestamp < component.updateTimestamp);
        return true;
    }
    get allowedNetworkComponents() {
        return this.$allowedNetworkComponents;
    }
}
