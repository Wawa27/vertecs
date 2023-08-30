import Component from "./Component";
import EcsManager from "./EcsManager";
import type { ComponentClass } from "./Component";
export interface EntityOptions {
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
export default class Entity {
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
