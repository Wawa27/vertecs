import System from './System';
import Entity from './Entity';
import Component, { ComponentClass } from './Component';

/**
 * The system manager is responsible for managing all the systems
 */
export default class SystemManager {
  #entities: Entity[] = [];
  readonly #entityGroups: Map<ComponentClass[], Entity[]>;
  readonly #systemGroups: Map<ComponentClass[], System[]>;

  static #instance: SystemManager;

  private constructor() {
    this.#systemGroups = new Map<ComponentClass[], System[]>();
    this.#entityGroups = new Map<ComponentClass[], Entity[]>();
  }

  public static getInstance(): SystemManager {
    if (!SystemManager.#instance) {
      SystemManager.#instance = new SystemManager();
    }
    return SystemManager.#instance;
  }

  /**
   * Add a system to the system manager
   */
  public addSystem(system: System): void {
    let systems = this.#systemGroups.get(system.filter);
    let entities = this.#entityGroups.get(system.filter);

    if (!systems || !entities) {
      this.#systemGroups.set(system.filter, [system]);
      this.#entityGroups.set(system.filter, []);

      // TODO: check if entities are eligible to this new group
    } else {
      systems.push(system);

      // Make old eligible entities trigger the eligible event
      entities.forEach(entity => system.onEntityEligible(entity, undefined));
    }
  }

  /**
   * The entry point of the ECS engine
   */
  public async start(): Promise<void> {
    Array.from(this.#systemGroups.values()).forEach(systems => {
      systems.forEach(async system => await system.onStart());
    });
    this.loop();
  }

  /**
   * Add multiple entities to the system manager
   */
  public addEntities(entities: Entity[]) {
    entities.forEach(entity => this.addEntity(entity));
  }

  /**
   * Add an entity to the system manager
   */
  public addEntity(entity: Entity) {
    if (this.#entities.includes(entity)) {
      return;
    }

    Array.from(this.#entityGroups.keys()).forEach(group => {
      if (this.isEntityEligibleToGroup(group, entity)) {
        let entities = this.#entityGroups.get(group);
        let systems = this.#systemGroups.get(group);
        if (entities && systems) {
          entities.push(entity);
          systems.forEach(system => system.onEntityEligible(entity, undefined));
        }
      }
    });

    if (entity.children.length > 0) {
      this.addEntities(entity.children);
    }

    this.#entities.push(entity);
  }

  /**
   * Loop through all the systems and call their loop method, this method should not be called manually,
   * see {@link start}
   */
  public loop() {
    this.#systemGroups.forEach((systems, group) => {
      systems.filter(system => system.hasEnoughTimePassed())
             .forEach(system => system.loop(this.#entityGroups.get(group) ?? []));
    });
    setTimeout(this.loop, 10);
  }

  /**
   * Check if an entity components is eligible to a group filter
   */
  private isEntityEligibleToGroup(group: ComponentClass[], entity: Entity): boolean {
    return group.every(systemComponentClass => {
      return entity.getComponent(systemComponentClass);
    });
  }

  /**
   * Called BEFORE a component is added to an entity
   * @param entity
   * @param component
   */
  public onComponentAddedToEntity(entity: Entity, component: Component): void {

  }

  /**
   * Called AFTER a component is removed from an entity
   * @param entity
   * @param component
   */
  public onComponentRemovedFromEntity(entity: Entity, component: Component): void {

  }

  public get entities(): Entity[] {
    return this.#entities;
  }
}