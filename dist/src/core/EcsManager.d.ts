import System from "./System";
import type { EntityOptions } from "./Entity";
import Entity from "./Entity";
import type { ComponentClass } from "./Component";
import Component from "./Component";
type EcsGroup = {
    entities: Entity[];
    components: Component[][];
    systems: System<any>[];
};
export type SystemConstructor<T extends System> = new (...args: any[]) => T;
/**
 * The system manager is responsible for managing all the systems
 */
export default class EcsManager {
    #private;
    readonly ecsGroups: Map<ComponentClass[], EcsGroup>;
    isStarted: boolean;
    constructor();
    /**
     * Create a new entity and add it to this ecs manager
     * @param options
     */
    createEntity(options?: EntityOptions): Entity;
    /**
     * Add a system to the system manager
     */
    addSystem(system: System<any>): Promise<void>;
    removeSystem(SystemConstructor: SystemConstructor<any>): void;
    /**
     * The entry point of the ECS engine
     */
    start(): Promise<void>;
    stop(): Promise<void>;
    /**
     * Add multiple entities to the system manager
     */
    addEntities(entities: Entity[]): void;
    /**
     * Add an entity to the system manager
     */
    addEntity(newEntity: Entity): void;
    removeEntity(entity: Entity): void;
    destroyEntity(entityId: string): void;
    /**
     * Loop through all the systems and call their loop method, this method should not be called manually,
     * see {@link start}
     */
    loop(): void;
    /**
     * Check if an entity components is eligible to a group filter
     */
    isEntityEligibleToGroup(group: ComponentClass[], entity: Entity): boolean;
    /**
     * Called after a component is added to an entity
     * @param entity
     * @param component
     */
    onComponentAddedToEntity(entity: Entity, component: Component): void;
    findSystem<T extends System<any>>(SystemConstructor: SystemConstructor<T>): T | undefined;
    /**
     * Called after a component is removed from an entity
     * This method will check if the entity is still eligible to the groups and flag it for deletion if not
     * @param entity
     * @param component
     */
    onComponentRemovedFromEntity(entity: Entity, component: Component): void;
    get entities(): Entity[];
    get loopTime(): number;
}
export {};
