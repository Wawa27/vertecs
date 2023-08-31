import Entity from "./Entity";
export type ComponentClass<T extends Component = any> = Function & {
    prototype: T;
};
export type ComponentClassConstructor<T extends Component = any> = new (...args: any[]) => T;
/**
 * A component is a piece of data that is attached to an entity
 */
export default abstract class Component {
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
