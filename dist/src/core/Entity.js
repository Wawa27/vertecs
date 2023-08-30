import { v4 as uuidv4 } from "uuid";
/**
 * An entity is a general purpose object which contains components
 */
export default class Entity {
    #ecsManager;
    #id;
    #components;
    #parent;
    #children;
    #name;
    #root;
    #tags;
    constructor(options) {
        this.#id = options?.id ?? uuidv4();
        this.#children = [];
        this.#components = [];
        this.#ecsManager = options?.ecsManager;
        options?.parent?.addChild(this);
        this.#name = options?.name;
        this.#root = this;
        this.#tags = [];
        if (this.#ecsManager) {
            this.#ecsManager.addEntity(this);
        }
        options?.children?.forEach((child) => this.addChild(child));
        // Add components one by one to trigger events
        options?.components?.forEach((component) => this.addComponent(component));
    }
    /**
     * Find an entity by it's id
     * @param ecsManager
     * @param id The entity id to find
     */
    static findById(ecsManager, id) {
        return ecsManager.entities.find((entity) => entity.id === id);
    }
    /**
     * Find an entity by a component
     * @param ecsManager
     * @param component The component class
     */
    static findByComponent(ecsManager, component) {
        return ecsManager.entities.find((entity) => entity.getComponent(component));
    }
    /**
     * Find an entity by a component
     * @param ecsManager The ecs manager
     * @param component The component class
     */
    static findAllByComponent(ecsManager, component) {
        return ecsManager.entities.filter((entity) => entity.getComponent(component));
    }
    /**
     * Find an entity by a tag
     * @param ecsManager
     * @param tag The tag
     */
    static findAllByTag(ecsManager, tag) {
        return ecsManager.entities.filter((entity) => entity.tags.includes(tag));
    }
    /**
     * Return the first child found with the specified name
     * @param name The child name
     */
    findChildByName(name) {
        for (let i = 0; i < this.children.length; i++) {
            const child = this.children[i];
            if (child.name === name) {
                return child;
            }
        }
        for (let i = 0; i < this.children.length; i++) {
            const child = this.children[i];
            const found = child.findChildByName(name);
            if (found) {
                return found;
            }
        }
        return undefined;
    }
    /**
     * Find the first entity in the entity hierarchy with the specified component
     * @param component
     */
    findWithComponent(component) {
        if (this.getComponent(component)) {
            return this;
        }
        return this.children.find((child) => child.findWithComponent(component));
    }
    /**
     * Return a component by its class
     * @param componentClass The component's class or subclass constructor
     */
    getComponent(componentClass) {
        return this.components.find((component) => component instanceof componentClass);
    }
    /**
     * Return the first component found in an entity hierarchy
     * @param componentConstructor The component's class or subclass constructor
     */
    findComponent(componentConstructor) {
        return this.findWithComponent(componentConstructor)?.getComponent(componentConstructor);
    }
    /**
     * Return all components present in the entity
     * @param filter
     */
    getComponents(filter) {
        if (!filter) {
            // Return all components when no filter is given
            return Array.from(this.#components.values());
        }
        return filter.map((filteredComponentClass) => this.getComponent(filteredComponentClass));
    }
    /**
     * Add a component to this entity
     * @param newComponent The component to add
     */
    addComponent(newComponent) {
        if (!this.getComponent(newComponent.constructor)) {
            newComponent.entity = this;
            this.components.push(newComponent);
            this.#ecsManager?.onComponentAddedToEntity(this, newComponent);
            newComponent.onAddedToEntity(this);
            this.#components.forEach((component) => {
                if (component !== newComponent) {
                    component.onComponentAddedToAttachedEntity(component);
                }
            });
        }
    }
    addComponents(...newComponents) {
        newComponents.forEach((component) => this.addComponent(component));
    }
    /**
     * Add a child to this entity
     * @param entity The child
     */
    addChild(entity) {
        this.#children.push(entity);
        entity.parent = this;
        entity.root = this.root;
        if (!entity.ecsManager) {
            this.ecsManager?.addEntity(entity);
        }
    }
    /**
     * Add a tag to an entity
     * @param tag The tag to add
     */
    addTag(tag) {
        this.#tags.push(tag);
    }
    /**
     * Remove a components from this entity
     * @param componentClass The component's class to remove
     */
    removeComponent(componentClass) {
        const component = this.getComponent(componentClass);
        if (component) {
            this.#components.splice(this.#components.indexOf(component), 1);
            this.#ecsManager?.onComponentRemovedFromEntity(this, component);
            component.onRemovedFromEntity(this);
            return component;
        }
        return undefined;
    }
    /**
     * Clone an entity's name, components, recursively
     */
    clone(id) {
        const clone = new Entity({
            name: this.#name,
            components: Array.from(this.#components.values()).map((component) => component.clone()),
            ecsManager: this.#ecsManager,
            id,
        });
        this.children.forEach((child) => {
            clone.addChild(child.clone());
        });
        return clone;
    }
    /**
     * Destroy this entity, remove and destroy all added components
     */
    destroy() {
        this.children.forEach((child) => child.destroy());
        for (let i = this.components.length - 1; i >= 0; i--) {
            this.removeComponent(this.components[i].constructor);
        }
        this.parent?.children.splice(this.parent.children.indexOf(this), 1);
        this.#ecsManager?.removeEntity(this);
    }
    get ecsManager() {
        return this.#ecsManager;
    }
    set ecsManager(value) {
        this.#ecsManager = value;
    }
    get tags() {
        return this.#tags;
    }
    get root() {
        return this.#root;
    }
    set root(value) {
        this.#root = value;
    }
    get components() {
        return this.#components;
    }
    get parent() {
        return this.#parent;
    }
    set parent(entity) {
        this.components.forEach((component) => component.onEntityNewParent(entity));
        this.#parent = entity;
        this.#root = entity?.root ?? this;
    }
    get name() {
        return this.#name;
    }
    set name(value) {
        this.#name = value;
    }
    get children() {
        return this.#children;
    }
    get id() {
        return this.#id;
    }
}
