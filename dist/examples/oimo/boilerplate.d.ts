type SystemConstructor<T extends Component[]> = new (...args: any[]) => System<T>;
/**
 * A system loops over all entities and uses the components of the entities to perform logic.
 */
declare abstract class System<T extends Component[] = [
]> {
    #private;
    protected ecsManager?: EcsManager;
    readonly filter: ComponentClass<T[number]>[];
    $dependencies: SystemConstructor<Component[]>[];
    /**
     * Create a new system with the given component group filter and the given tps
     */
    protected constructor(filter: ComponentClass<T[number]>[], tps?: number, dependencies?: SystemConstructor<Component[]>[]);
    /**
     * Called every frame, you should not call this method directly but instead use the {@see onLoop} method
     */
    loop(components: T[], entities: Entity[]): void;
    start(ecsManager: EcsManager): Promise<void>;
    stop(): Promise<void>;
    sleep(milliseconds: number): void;
    /**
     * Called when the system is added to an ecs manager
     * @param ecsManager
     */
    onAddedToEcsManager(ecsManager: EcsManager): void;
    /**
     * Called when the system is added to an ecs manager
     */
    initialize(): Promise<void>;
    /**
     * Called when the system is ready to start
     */
    onStart(): Promise<void>;
    /**
     * Called when the system is stopped
     */
    onStop(): Promise<void>;
    /**
     * Called whenever an entity becomes eligible to a system
     * An entity becomes eligible when a component is added to an entity making it eligible to a group,
     * or when a new system is added and an entity was already eligible to the new system's group
     */
    onEntityEligible(entity: Entity, components: T): void;
    /**
     * Called when an entity becomes ineligible to a system, and before it is removed from the system
     */
    onEntityNoLongerEligible(entity: Entity, components: T): void;
    /**
     * Called every frame
     * @param components
     * @param entities
     * @param deltaTime The time since the last loop
     */
    protected abstract onLoop(components: T[], entities: Entity[], deltaTime: number): void;
    /**
     * Return the time since the last update
     * @private
     */
    private getDeltaTime;
    /**
     * Return true if enough time has passed since the last update, false otherwise
     */
    hasEnoughTimePassed(): boolean;
    get dependencies(): SystemConstructor<Component[]>[];
    get lastUpdateTime(): number;
    set lastUpdateTime(value: number);
    get loopTime(): number;
    get tps(): number;
    set tps(value: number);
    get hasStarted(): boolean;
    set hasStarted(value: boolean);
}
type EcsGroup = {
    entities: Entity[];
    components: Component[][];
    systems: System<any>[];
};
type SystemConstructor$0<T extends System> = new (...args: any[]) => T;
/**
 * The system manager is responsible for managing all the systems
 */
declare class EcsManager {
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
    removeSystem(SystemConstructor: SystemConstructor$0<any>): void;
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
    findSystem<T extends System<any>>(SystemConstructor: SystemConstructor$0<T>): T | undefined;
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
interface EntityOptions {
    id?: string;
    name?: string;
    components?: Component[];
    children?: Entity[];
    ecsManager?: EcsManager;
    parent?: Entity;
}
/**
 * An entity is a general purpose object which contains components
 */
declare class Entity {
    #private;
    constructor(options?: EntityOptions);
    /**
     * Find an entity by it's id
     * @param ecsManager
     * @param id The entity id to find
     */
    static findById(ecsManager: EcsManager, id: string): Entity | undefined;
    /**
     * Find an entity by a component
     * @param ecsManager
     * @param component The component class
     */
    static findByComponent(ecsManager: EcsManager, component: ComponentClass): Entity | undefined;
    /**
     * Find an entity by a component
     * @param ecsManager The ecs manager
     * @param component The component class
     */
    static findAllByComponent(ecsManager: EcsManager, component: ComponentClass): Entity[];
    /**
     * Find an entity by a tag
     * @param ecsManager
     * @param tag The tag
     */
    static findAllByTag(ecsManager: EcsManager, tag: string): Entity[];
    /**
     * Return the first child found with the specified name
     * @param name The child name
     */
    findChildByName(name: string): Entity | undefined;
    /**
     * Find the first entity in the entity hierarchy with the specified component
     * @param component
     */
    findWithComponent(component: ComponentClass): Entity | undefined;
    /**
     * Return a component by its class
     * @param componentClass The component's class or subclass constructor
     */
    getComponent<T extends Component>(componentClass: ComponentClass<T>): T | undefined;
    /**
     * Return the first component found in an entity hierarchy
     * @param componentConstructor The component's class or subclass constructor
     */
    findComponent<T extends Component>(componentConstructor: ComponentClass<T>): T | undefined;
    /**
     * Return all components present in the entity
     * @param filter
     */
    getComponents<T extends Component>(filter?: ComponentClass<T>[]): (T | undefined)[];
    /**
     * Add a component to this entity
     * @param newComponent The component to add
     */
    addComponent(newComponent: Component): void;
    addComponents(...newComponents: Component[]): void;
    /**
     * Add a child to this entity
     * @param entity The child
     */
    addChild(entity: Entity): void;
    /**
     * Add a tag to an entity
     * @param tag The tag to add
     */
    addTag(tag: string): void;
    /**
     * Remove a components from this entity
     * @param componentClass The component's class to remove
     */
    removeComponent<T extends Component>(componentClass: ComponentClass<T>): T | undefined;
    /**
     * Clone an entity's name, components, recursively
     */
    clone(id?: string): Entity;
    /**
     * Destroy this entity, remove and destroy all added components
     */
    destroy(): void;
    get ecsManager(): EcsManager | undefined;
    set ecsManager(value: EcsManager | undefined);
    get tags(): string[];
    get root(): Entity;
    set root(value: Entity);
    get components(): Component[];
    get parent(): Entity | undefined;
    set parent(entity: Entity | undefined);
    get name(): string | undefined;
    set name(value: string | undefined);
    get children(): Entity[];
    get id(): string;
}
type ComponentClass<T extends Component = any> = Function & {
    prototype: T;
};
/**
 * A component is a piece of data that is attached to an entity
 */
declare abstract class Component {
    #private;
    /**
     * The entity this component is attached to
     * @protected
     */
    protected $entity?: Entity;
    /**
     * Create a new component
     */
    protected constructor(id?: string);
    /**
     * Called when the component is added to the entity
     */
    onAddedToEntity(entity: Entity): void;
    /**
     * Called when the component is removed from the entity
     */
    onRemovedFromEntity(entity: Entity): void;
    /**
     * Called when the attached entity has a new parent
     * This method is called before the parent is updated
     * @param entity The new parent entity
     */
    onEntityNewParent(entity?: Entity): void;
    /**
     * Called when another component is added to the attached entity
     * @param component
     */
    onComponentAddedToAttachedEntity(component: Component): void;
    /**
     * This method is called when the {@see destroy} method is called
     */
    onDestroyed(): void;
    /**
     * Return a new clone of this component, by default, it returns the same component
     */
    clone(): Component;
    get id(): string;
    get entity(): Entity | undefined;
    set entity(value: Entity | undefined);
}
declare const spawnCube: (position: [number, number, number], scale: [number, number, number], rotation: [number, number, number]) => void;
declare const spawnSphere: (position: [number, number, number], radius: number) => void;
declare const initializeBoilerplate: () => Promise<EcsManager>;
export { spawnCube, spawnSphere, initializeBoilerplate };
