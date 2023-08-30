import System from "./System";
import type { EntityOptions } from "./Entity";
import Entity from "./Entity";
import type { ComponentClass } from "./Component";
import Component from "./Component";
import DependencyGraph from "./DependencyGraph";

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
    #entities: Entity[] = [];

    readonly ecsGroups: Map<ComponentClass[], EcsGroup>;

    isStarted: boolean;

    #loopTime: number;

    public constructor() {
        this.ecsGroups = new Map();
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

        let ecsGroup = this.ecsGroups.get(system.filter);

        if (!system.hasStarted) {
            await system.start(this);
        }

        if (!ecsGroup) {
            ecsGroup = {
                entities: [],
                components: [],
                systems: [system],
            };
            this.ecsGroups.set(system.filter, ecsGroup);
        }

        this.#entities?.forEach((entity) => {
            if (
                ecsGroup &&
                this.isEntityEligibleToGroup(system.filter, entity)
            ) {
                const components = entity.getComponents(system.filter);
                system.onEntityEligible(entity, components);
                ecsGroup.entities.push(entity);
                ecsGroup.components.push(components);
            }
        });

        await system.initialize();
    }

    public removeSystem(SystemConstructor: SystemConstructor<any>): void {
        const system = this.findSystem(SystemConstructor);

        if (!system) {
            return;
        }

        const ecsGroup = this.ecsGroups.get(system.filter);
        if (!ecsGroup) {
            return;
        }
        const systemIndex = ecsGroup.systems.indexOf(system);
        if (systemIndex === -1) {
            return;
        }

        ecsGroup.systems.splice(systemIndex, 1);
        if (ecsGroup.systems.length === 0) {
            this.ecsGroups.delete(system.filter);
        }

        ecsGroup.entities.forEach((entity, i) => {
            const components = ecsGroup.components[i];
            system.onEntityNoLongerEligible(entity, components);
        });

        system.stop();
    }

    /**
     * The entry point of the ECS engine
     */
    public async start(): Promise<void> {
        this.isStarted = true;

        Array.from(this.ecsGroups.values()).forEach((ecsGroup) => {
            ecsGroup.systems.forEach(async (system) => {
                if (!system.hasStarted) {
                    await system.start(this);
                }
            });
        });
        setTimeout(this.loop.bind(this));
    }

    public async stop(): Promise<void> {
        Array.from(this.ecsGroups.values()).forEach((ecsGroup) => {
            ecsGroup.systems.forEach(async (system) => {
                if (system.hasStarted) {
                    await system.stop();
                }
            });
        });
        this.isStarted = false;
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
        if (this.#entities.find((entity) => entity.id === newEntity.id)) {
            throw new Error(`Entity found with same ID: ${newEntity.id}`);
        }

        newEntity.ecsManager = this;

        Array.from(this.ecsGroups.entries()).forEach(([filter, ecsGroup]) => {
            if (
                this.isEntityEligibleToGroup(filter, newEntity) &&
                !ecsGroup.entities.includes(newEntity)
            ) {
                ecsGroup.entities.push(newEntity);
                const components = newEntity.getComponents(filter);
                ecsGroup.systems.forEach((system) =>
                    system.onEntityEligible(newEntity, components)
                );
                ecsGroup.components.push(components);
            }
        });

        if (newEntity.children.length > 0) {
            this.addEntities(newEntity.children);
        }

        this.#entities.push(newEntity);
    }

    public removeEntity(entity: Entity) {
        const entityIndex = this.#entities.indexOf(entity);
        if (entityIndex === -1) {
            return;
        }
        this.#entities.splice(entityIndex, 1);
        Array.from(this.ecsGroups.entries()).forEach(([filter, ecsGroup]) => {
            const entityIndex = ecsGroup.entities.indexOf(entity);
            if (entityIndex !== -1) {
                const components = ecsGroup.components[entityIndex];
                ecsGroup.systems.forEach((system) =>
                    system.onEntityNoLongerEligible(entity, components)
                );
                ecsGroup.entities.splice(entityIndex, 1);
                ecsGroup.components.splice(entityIndex, 1);
            }
        });
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
        if (this.ecsGroups.size === 0) {
            throw new Error("No system found");
        }

        if (!this.isStarted) {
            return;
        }

        // Make a tree of systems based on their dependencies
        const systemsToUpdate: System<any>[] = [];
        this.ecsGroups.forEach((ecsGroup, group) => {
            ecsGroup.systems
                .filter((system) => system.hasEnoughTimePassed())
                .forEach((system) => systemsToUpdate.push(system));
        });

        DependencyGraph.getOrderedSystems(systemsToUpdate).forEach((system) => {
            const ecsGroup = this.ecsGroups.get(system.filter);

            if (!ecsGroup) {
                return;
            }

            system.loop(ecsGroup.components as [][], ecsGroup.entities);
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
        Array.from(this.ecsGroups.keys()).forEach((group) => {
            if (this.isEntityEligibleToGroup(group, entity)) {
                const ecsGroup = this.ecsGroups.get(group);
                if (ecsGroup && !ecsGroup.entities.includes(entity)) {
                    const components = entity.getComponents(group);
                    ecsGroup.entities.push(entity);
                    ecsGroup.systems.forEach((system) =>
                        system.onEntityEligible(entity, components)
                    );
                    ecsGroup.components.push(components);
                }
            }
        });
    }

    public findSystem<T extends System<any>>(
        SystemConstructor: SystemConstructor<T>
    ): T | undefined {
        return Array.from(this.ecsGroups.values())
            .flatMap((ecsGroup) => ecsGroup.systems)
            .find((system) => system instanceof SystemConstructor) as
            | T
            | undefined;
    }

    /**
     * Called after a component is removed from an entity
     * This method will check if the entity is still eligible to the groups and flag it for deletion if not
     * @param entity
     * @param component
     */
    public onComponentRemovedFromEntity(
        entity: Entity,
        component: Component
    ): void {
        Array.from(this.ecsGroups.entries()).forEach(([filter, ecsGroup]) => {
            if (
                !this.isEntityEligibleToGroup(filter, entity) &&
                ecsGroup.entities?.includes(entity)
            ) {
                const entityToDeleteIndex = ecsGroup.entities.indexOf(entity);
                const components = ecsGroup.components[entityToDeleteIndex];

                ecsGroup.systems.forEach((system) =>
                    system.onEntityNoLongerEligible(entity, components)
                );

                ecsGroup.entities.splice(entityToDeleteIndex, 1);
                ecsGroup.components.splice(entityToDeleteIndex, 1);
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
