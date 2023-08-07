import { Entity, System } from "../core";
import { SerializedEntity } from "../io";
import type {
    ComponentClass,
    ComponentClassConstructor,
} from "../core/Component";
import GameState from "./GameState";
import type SerializedNetworkComponent from "./NetworkComponent";
import NetworkComponent from "./NetworkComponent";
import NetworkEntity from "./NetworkEntity";

/**
 * The networking system is responsible for sending and receiving entities over the networking.
 * This class is used by the server and the client to provide a common interface for formatting entities.
 */
export default class NetworkSystem extends System {
    #previousSnapshots: GameState[];

    protected $currentSnapshot: GameState;

    $allowedNetworkComponents: ComponentClass[];

    public constructor(
        allowedNetworkComponents: ComponentClass[],
        tps?: number
    ) {
        super([NetworkComponent], tps);

        this.$allowedNetworkComponents = allowedNetworkComponents;
        this.#previousSnapshots = [];
        this.$currentSnapshot = new GameState();
    }

    protected onLoop(entities: Entity[], deltaTime: number): void {}

    /**
     * Deserialize the components of the serialized entity and add them to the target entity.
     * @param serializedEntity
     * @param targetEntity
     */
    public deserializeEntity(
        serializedEntity: NetworkEntity,
        targetEntity: Entity
    ) {
        if (serializedEntity.destroyed) {
            targetEntity.destroy();
            return;
        }

        serializedEntity.components.forEach((networkComponent) => {
            const ComponentConstructor = this.$allowedNetworkComponents.find(
                (ComponentClass) =>
                    ComponentClass.name === networkComponent.className
            ) as ComponentClassConstructor;

            if (!ComponentConstructor) {
                console.warn(
                    `Received unknown component from server ${networkComponent.className}`
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

            if (networkComponent.updateTimestamp && component.updateTimestamp) {
                // If the component is older than the last update, ignore it
                // Clients should check if the server component match with the old state of the entity
                // If it doesn't match, the client should roll back the entity to this state
                if (
                    networkComponent.updateTimestamp <=
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

            component.deserialize(networkComponent);
            component.forceUpdate = true;
        });
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
