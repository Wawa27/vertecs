import { v4 as uuidv4 } from "uuid";
import Component from "./Component";
import EcsManager from "./EcsManager";
import type { ComponentClass } from "./Component";

export interface EntityOptions {
    id?: string;
    name?: string;
    components?: Component[];
    children?: Entity[];
    ecsManager?: EcsManager;
}

/**
 * An entity is a general purpose object which contains components
 */
export default class Entity {
    #ecsManager?: EcsManager;

    readonly #id: string;

    readonly #components: Component[];

    #parent?: Entity;

    readonly #children: Entity[];

    #name?: string;

    #root: Entity;

    readonly #tags: string[];

    public constructor(options?: EntityOptions) {
        this.#id = options?.id ?? uuidv4();
        this.#children = [];
        this.#components = [];
        this.#name = options?.name;
        this.#root = this;
        this.#tags = [];
        this.#ecsManager = options?.ecsManager;

        options?.children?.forEach((child) => this.addChild(child));

        if (this.#ecsManager) {
            this.#ecsManager.addEntity(this);
        }

        // Add components one by one to trigger events
        options?.components?.forEach((component) =>
            this.addComponent(component)
        );
    }

    /**
     * Find an entity by it's id
     * @param ecsManager
     * @param id The entity id to find
     */
    public static findById(
        ecsManager: EcsManager,
        id: string
    ): Entity | undefined {
        return ecsManager.entities.find((entity) => entity.id === id);
    }

    /**
     * Find an entity by a component
     * @param ecsManager
     * @param component The component class
     */
    public static findByComponent(
        ecsManager: EcsManager,
        component: ComponentClass
    ): Entity | undefined {
        return ecsManager.entities.find((entity) =>
            entity.getComponent(component)
        );
    }

    /**
     * Find an entity by a component
     * @param ecsManager The ecs manager
     * @param component The component class
     */
    public static findAllByComponent(
        ecsManager: EcsManager,
        component: ComponentClass
    ): Entity[] {
        return ecsManager.entities.filter((entity) =>
            entity.getComponent(component)
        );
    }

    /**
     * Find an entity by a tag
     * @param ecsManager
     * @param tag The tag
     */
    public static findAllByTag(ecsManager: EcsManager, tag: string): Entity[] {
        return ecsManager.entities.filter((entity) =>
            entity.tags.includes(tag)
        );
    }

    /**
     * Return the first child found with the specified name
     * @param name The child name
     */
    public findChildByName(name: string): Entity | undefined {
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
    public findWithComponent(component: ComponentClass): Entity | undefined {
        if (this.getComponent(component)) {
            return this;
        }
        return this.children.find((child) =>
            child.findWithComponent(component)
        );
    }

    /**
     * Return a component by its class
     * @param componentClass The component's class or subclass constructor
     */
    public getComponent<T extends Component>(
        componentClass: ComponentClass<T>
    ): T | undefined {
        return this.components.find(
            (component) => component instanceof componentClass
        ) as T | undefined;
    }

    /**
     * Return the first component found in an entity hierarchy
     * @param componentConstructor The component's class or subclass constructor
     */
    public findComponent<T extends Component>(
        componentConstructor: ComponentClass<T>
    ): T | undefined {
        return this.findWithComponent(componentConstructor)?.getComponent(
            componentConstructor
        );
    }

    /**
     * Return all components present in the entity
     * @param filter
     */
    public getComponents<T extends Component>(
        filter?: ComponentClass<T>[]
    ): (T | undefined)[] {
        if (!filter) {
            // Return all components when no filter is given
            return Array.from(this.#components.values()) as T[];
        }

        return filter.map((filteredComponentClass) =>
            this.getComponent(filteredComponentClass)
        );
    }

    /**
     * Add a component to this entity
     * @param newComponent The component to add
     */
    public addComponent(newComponent: Component) {
        if (!this.getComponent(newComponent.constructor as ComponentClass)) {
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

    public addComponents(...newComponents: Component[]) {
        newComponents.forEach((component) => this.addComponent(component));
    }

    /**
     * Add a child to this entity
     * @param entity The child
     */
    public addChild(entity: Entity) {
        this.#children.push(entity);
        entity.parent = this;
        entity.root = this.root;
        if (!entity.ecsManager) {
            this.ecsManager?.addEntity(entity);
        }
    }

    public detachChild(entity: Entity) {
        this.#children.filter((element) => element !== entity);
    }

    /**
     * Add a tag to an entity
     * @param tag The tag to add
     */
    public addTag(tag: string) {
        this.#tags.push(tag);
    }

    /**
     * Remove a components from this entity
     * @param componentClass The component's class to remove
     */
    public removeComponent<T extends Component>(
        componentClass: ComponentClass<T>
    ): T | undefined {
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
    public clone(): Entity {
        const clone = new Entity({
            name: this.#name,
            components: Array.from(this.#components.values()).map((component) =>
                component.clone()
            ),
            ecsManager: this.#ecsManager,
        });

        this.children.forEach((child) => {
            clone.addChild(child.clone());
        });

        return clone;
    }

    /**
     * Destroy this entity, remove and destroy all added components
     */
    public destroy(): void {
        this.children.forEach((child) => child.destroy());
        for (let i = this.components.length - 1; i >= 0; i--) {
            this.removeComponent(
                this.components[i].constructor as ComponentClass
            );
        }
        this.parent?.children.splice(this.parent.children.indexOf(this), 1);
    }

    public get ecsManager(): EcsManager | undefined {
        return this.#ecsManager;
    }

    public set ecsManager(value: EcsManager | undefined) {
        this.#ecsManager = value;
    }

    public get tags(): string[] {
        return this.#tags;
    }

    public get root(): Entity {
        return this.#root;
    }

    public set root(value: Entity) {
        this.#root = value;
    }

    public get components(): Component[] {
        return this.#components;
    }

    public get parent(): Entity | undefined {
        return this.#parent;
    }

    public set parent(entity: Entity | undefined) {
        this.#parent = entity;
        this.#root = entity?.root ?? this;
        this.components.forEach((component) =>
            component.onEntityParentChanged(entity)
        );
    }

    public get name(): string | undefined {
        return this.#name;
    }

    public set name(value: string | undefined) {
        this.#name = value;
    }

    public get children(): Entity[] {
        return this.#children;
    }

    public get id(): string {
        return this.#id;
    }
}
