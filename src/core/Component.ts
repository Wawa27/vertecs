import { v4 as uuidv4 } from "uuid";
import Entity from "./Entity";

export type ComponentClass<T extends Component = any> = {
    new (...args: any[]): T;
};

/**
 * A component is a piece of data that is attached to an entity
 */
export default abstract class Component {
    /**
     * The component id
     * @private
     */
    readonly #id: string;

    /**
     * The entity this component is attached to
     * @protected
     */
    protected $entity?: Entity;

    /**
     * Create a new component
     */
    protected constructor(id?: string) {
        this.#id = id ?? uuidv4();
    }

    /**
     * Called when the component is added to the entity
     */
    public onAddedToEntity(entity: Entity): void {}

    /**
     * Called when the component is removed from the entity
     */
    public onRemovedFromEntity(entity: Entity): void {}

    /**
     * Called whenever the attached entity parent change
     * @param entity The new parent entity
     */
    public onEntityParentChanged(entity: Entity): void {}

    /**
     * This method is called when the {@see destroy} method is called
     */
    public onDestroyed(): void {}

    /**
     * Return a new clone of this component, by default, it returns the same component
     */
    public clone(): Component {
        return this;
    }

    public get id(): string {
        return this.#id;
    }

    public get entity(): Entity | undefined {
        return this.$entity;
    }

    public set entity(value: Entity | undefined) {
        this.$entity = value;
    }
}
