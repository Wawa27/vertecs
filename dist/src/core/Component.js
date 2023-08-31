import { v4 as uuidv4 } from "uuid";
/**
 * A component is a piece of data that is attached to an entity
 */
export default class Component {
    /**
     * The component id
     * @private
     */
    #id;
    /**
     * The entity this component is attached to
     * @protected
     */
    $entity;
    /**
     * Create a new component
     */
    constructor(id) {
        this.#id = id ?? uuidv4();
    }
    /**
     * Called when the component is added to the entity
     */
    onAddedToEntity(entity) { }
    /**
     * Called when the component is removed from the entity
     */
    onRemovedFromEntity(entity) { }
    /**
     * Called when the attached entity has a new parent
     * This method is called before the parent is updated
     * @param entity The new parent entity
     */
    onEntityNewParent(entity) { }
    /**
     * Called when another component is added to the attached entity
     * @param component
     */
    onComponentAddedToAttachedEntity(component) { }
    /**
     * This method is called when the {@see destroy} method is called
     */
    onDestroyed() { }
    /**
     * Return a new clone of this component, by default, it returns the same component
     */
    clone() {
        return this;
    }
    get id() {
        return this.#id;
    }
    get entity() {
        return this.$entity;
    }
    set entity(value) {
        this.$entity = value;
    }
}
