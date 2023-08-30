import { Entity, System } from "../core";
import { SerializedEntity } from "../io";
import type { ComponentClass } from "../core/Component";
import Component from "../core/Component";
import GameState from "./GameState";
import NetworkComponent, { SerializedNetworkComponent } from "./NetworkComponent";
import NetworkEntity from "./NetworkEntity";
import IsNetworked from "./IsNetworked";
/**
 * The networking system is responsible for sending and receiving entities over the networking.
 * This class is used by the server and the client to provide a common interface for formatting entities.
 */
export default class NetworkSystem extends System<[IsNetworked]> {
    #private;
    protected $currentSnapshot: GameState;
    $allowedNetworkComponents: ComponentClass<Component>[];
    constructor(allowedNetworkComponents: ComponentClass[], tps?: number);
    protected onLoop(components: [IsNetworked][], entities: Entity[], deltaTime: number): void;
    /**
     * Deserialize the components of the serialized entity and add them to the target entity.
     * @param serializedEntity
     */
    protected deserializeEntity(serializedEntity: NetworkEntity): void;
    protected deserializeComponent(serializedNetworkComponent: SerializedNetworkComponent<any>, targetEntity: Entity): void;
    protected serializeEntity(entity: Entity): NetworkEntity | undefined;
    protected serializeComponent(component: NetworkComponent<any>): SerializedNetworkComponent<any> | undefined;
    /**
     *
     * @param snapshot
     * @param entity
     * @param component
     */
    isOutOfSync(snapshot: GameState, entity: SerializedEntity, component: SerializedNetworkComponent<any>): boolean;
    get allowedNetworkComponents(): ComponentClass[];
}
