import System from "./System";
import Entity from "./Entity";
import Component, { ComponentClass } from "./Component";

/**
 * The system manager is responsible for managing all the systems
 */
export default class EcsManager {
    #entities: Entity[] = [];

    readonly entityGroups: Map<ComponentClass[], Entity[]>;

    readonly systemGroups: Map<ComponentClass[], System[]>;

    public constructor() {
        this.systemGroups = new Map<ComponentClass[], System[]>();
        this.entityGroups = new Map<ComponentClass[], Entity[]>();
    }

    /**
     * Add a system to the system manager
     */
    public async addSystem(system: System): Promise<void> {
        const systems = this.systemGroups.get(system.filter);
        const entities = this.entityGroups.get(system.filter);

        if (!system.hasStarted) {
            await system.start(this);
        }

        if (!systems || !entities) {
            this.systemGroups.set(system.filter, [system]);
            this.entityGroups.set(system.filter, []);

            // TODO: check if entities are eligible to this new group
        } else {
            systems.push(system);

            // Make old eligible entities trigger the eligible event
            entities.forEach((entity) =>
                system.onEntityEligible(entity, undefined)
            );
        }
    }

    /**
     * The entry point of the ECS engine
     */
    public async start(): Promise<void> {
        Array.from(this.systemGroups.values()).forEach((systems) => {
            systems.forEach(async (system) => {
                if (!system.hasStarted) {
                    await system.start(this);
                }
            });
        });
        this.loop();
    }

    /**
     * Add multiple entities to the system manager
     */
    public addEntities(entities: Entity[]) {
        entities.forEach((entity) => this.addEntity(entity));
    }

    /**
     * Add an entity to the system manager
     */
    public addEntity(newEntity: Entity) {
        if (this.entities.find((entity) => entity.id === newEntity.id)) {
            throw new Error(`Entity found with same ID: ${newEntity.id}`);
        }

        Array.from(this.entityGroups.keys()).forEach((group) => {
            if (this.isEntityEligibleToGroup(group, newEntity)) {
                const entities = this.entityGroups.get(group);
                const systems = this.systemGroups.get(group);
                if (entities && systems) {
                    entities.push(newEntity);
                    systems.forEach((system) =>
                        system.onEntityEligible(newEntity, undefined)
                    );
                }
            }
        });

        if (newEntity.children.length > 0) {
            this.addEntities(newEntity.children);
        }

        this.#entities.push(newEntity);
    }

    /**
     * Loop through all the systems and call their loop method, this method should not be called manually,
     * see {@link start}
     */
    public loop() {
        this.systemGroups.forEach((systems, group) => {
            systems
                .filter((system) => system.hasEnoughTimePassed())
                .forEach((system) =>
                    system.loop(this.entityGroups.get(group) ?? [])
                );
        });
        setTimeout(this.loop.bind(this), 10);
    }

    /**
     * Check if an entity components is eligible to a group filter
     */
    private isEntityEligibleToGroup(
        group: ComponentClass[],
        entity: Entity
    ): boolean {
        return group.every((systemComponentClass) =>
            entity.getComponent(systemComponentClass)
        );
    }

    /**
     * Called BEFORE a component is added to an entity
     * @param entity
     * @param component
     */
    public onComponentAddedToEntity(
        entity: Entity,
        component: Component
    ): void {}

    /**
     * Called AFTER a component is removed from an entity
     * @param entity
     * @param component
     */
    public onComponentRemovedFromEntity(
        entity: Entity,
        component: Component
    ): void {}

    public get entities(): Entity[] {
        return this.#entities;
    }
}
