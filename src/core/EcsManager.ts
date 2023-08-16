import System from "./System";
import type { EntityOptions } from "./Entity";
import Entity from "./Entity";
import type { ComponentClass } from "./Component";
import Component from "./Component";
import DependencyGraph from "./DependencyGraph";

/**
 * The system manager is responsible for managing all the systems
 */
export default class EcsManager {
    #entities: Entity[] = [];

    readonly entityGroups: Map<ComponentClass[], Entity[]>;

    readonly systemGroups: Map<ComponentClass[], System<any>[]>;

    readonly componentGroups: Map<ComponentClass[], Component[][]>;

    isStarted: boolean;

    #loopTime: number;

    public constructor() {
        this.systemGroups = new Map<ComponentClass[], System<any>[]>();
        this.entityGroups = new Map<ComponentClass[], Entity[]>();
        this.componentGroups = new Map<ComponentClass[], Component[][]>();
        this.isStarted = false;
        this.#loopTime = 0;
    }

    /**
     * Create a new entity and add it to this ecs manager
     * @param options
     */
    public createEntity(options?: EntityOptions): Entity {
        return new Entity({ ...options, ecsManager: this });
    }

    /**
     * Add a system to the system manager
     */
    public async addSystem(system: System<any>): Promise<void> {
        system.onAddedToEcsManager(this);

        const systems = this.systemGroups.get(system.filter);
        const entities = this.entityGroups.get(system.filter);
        const components = this.componentGroups.get(system.filter);

        if (!system.hasStarted) {
            await system.start(this);
        }

        if (!systems || !entities) {
            this.systemGroups.set(system.filter, [system]);
            this.entityGroups.set(system.filter, []);
            this.componentGroups.set(system.filter, []);

            const entities = this.entityGroups.get(system.filter);
            const systems = this.systemGroups.get(system.filter);
            const components = this.componentGroups.get(system.filter);

            this.entities?.forEach((entity) => {
                if (this.isEntityEligibleToGroup(system.filter, entity)) {
                    system.onEntityEligible(entity, undefined);
                    entities!.push(entity);
                    components!.push(entity.getComponents(system.filter));
                }
            });
        } else {
            systems.push(system);

            // Make old eligible entities trigger the eligible event
            entities.forEach((entity) =>
                system.onEntityEligible(entity, undefined)
            );
        }

        await system.initialize();
    }

    /**
     * The entry point of the ECS engine
     */
    public async start(): Promise<void> {
        this.isStarted = true;

        Array.from(this.systemGroups.values()).forEach((systems) => {
            systems.forEach(async (system) => {
                if (!system.hasStarted) {
                    await system.start(this);
                }
            });
        });
        setTimeout(this.loop.bind(this));
    }

    public async stop(): Promise<void> {
        Array.from(this.systemGroups.values()).forEach((systems) => {
            systems.forEach(async (system) => {
                if (system.hasStarted) {
                    await system.stop();
                }
            });
        });
    }

    /**
     * Add multiple entities to the system manager
     */
    public addEntities(entities: Entity[]) {
        entities.forEach((entity) => {
            if (entity.ecsManager !== this) {
                this.addEntity(entity);
            }
        });
    }

    /**
     * Add an entity to the system manager
     */
    public addEntity(newEntity: Entity) {
        if (this.entities.find((entity) => entity.id === newEntity.id)) {
            throw new Error(`Entity found with same ID: ${newEntity.id}`);
        }

        newEntity.ecsManager = this;

        Array.from(this.entityGroups.keys()).forEach((group) => {
            if (this.isEntityEligibleToGroup(group, newEntity)) {
                const entities = this.entityGroups.get(group);
                const systems = this.systemGroups.get(group);
                const components = this.componentGroups.get(group);
                if (entities && systems && components) {
                    entities.push(newEntity);
                    systems.forEach((system) =>
                        system.onEntityEligible(newEntity, undefined)
                    );
                    components.push(newEntity.getComponents(group));
                }
            }
        });

        if (newEntity.children.length > 0) {
            this.addEntities(newEntity.children);
        }

        this.#entities.push(newEntity);
    }

    public destroyEntity(entityId: string): void {
        const entityToDestroy = this.#entities.find(
            (entity) => entity.id === entityId
        );
        entityToDestroy?.destroy();
    }

    /**
     * Loop through all the systems and call their loop method, this method should not be called manually,
     * see {@link start}
     */
    public loop() {
        const start = performance.now();
        if (this.systemGroups.size === 0) {
            throw new Error("No system found");
        }

        if (!this.isStarted) {
            return;
        }

        // Make a tree of systems based on their dependencies
        const systemsToUpdate: System<any>[] = [];
        this.systemGroups.forEach((systems, group) => {
            systems
                .filter((system) => system.hasEnoughTimePassed())
                .forEach((system) => systemsToUpdate.push(system));
        });

        DependencyGraph.getOrderedSystems(systemsToUpdate).forEach((system) => {
            const group = this.componentGroups.get(system.filter);
            const entities = this.entityGroups.get(system.filter);

            if (!group || !entities) {
                throw new Error("Group or entities not found");
            }

            system.loop(group as [][], entities);
        });

        this.#loopTime = performance.now() - start;

        if (typeof requestAnimationFrame === "undefined") {
            setImmediate(this.loop.bind(this));
        } else {
            requestAnimationFrame(this.loop.bind(this));
        }
    }

    /**
     * Check if an entity components is eligible to a group filter
     */
    public isEntityEligibleToGroup(
        group: ComponentClass[],
        entity: Entity
    ): boolean {
        return group.every((systemComponentClass) =>
            entity.getComponent(systemComponentClass)
        );
    }

    /**
     * Called after a component is added to an entity
     * @param entity
     * @param component
     */
    public onComponentAddedToEntity(
        entity: Entity,
        component: Component
    ): void {
        Array.from(this.entityGroups.keys()).forEach((group) => {
            if (this.isEntityEligibleToGroup(group, entity)) {
                const entities = this.entityGroups.get(group);
                const systems = this.systemGroups.get(group);
                const components = this.componentGroups.get(group);
                if (
                    entities &&
                    systems &&
                    components &&
                    !entities.includes(entity)
                ) {
                    entities.push(entity);
                    systems.forEach((system) =>
                        system.onEntityEligible(entity, component)
                    );
                    components.push(entity.getComponents(group));
                }
            }
        });
    }

    public findSystem<T extends System<any>>(
        SystemClass: new () => T
    ): T | undefined {
        return Array.from(this.systemGroups.values())
            .flat()
            .find((system) => system instanceof SystemClass) as T;
    }

    /**
     * Called after a component is removed from an entity
     * This method will check if the entity is still eligible to the groups
     * @param entity
     * @param component
     */
    public onComponentRemovedFromEntity(
        entity: Entity,
        component: Component
    ): void {
        Array.from(this.entityGroups.keys()).forEach((group) => {
            const entities = this.entityGroups.get(group);
            const components = this.componentGroups.get(group);
            const systems = this.systemGroups.get(group);

            if (
                !this.isEntityEligibleToGroup(group, entity) &&
                entities?.includes(entity)
            ) {
                entities.splice(entities.indexOf(entity), 1);
                components?.splice(
                    components.indexOf(entity.getComponents(group)),
                    1
                );
                systems?.forEach((system) =>
                    system.onEntityNoLongerEligible(entity, component)
                );
            }
        });
    }

    public get entities(): Entity[] {
        return this.#entities;
    }

    public get loopTime(): number {
        return this.#loopTime;
    }
}
