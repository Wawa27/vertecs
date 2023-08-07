import Component from "./Component";
import type { ComponentClass } from "./Component";
import Entity from "./Entity";
import EcsManager from "./EcsManager";

/**
 * A system loops over all entities and uses the components of the entities to perform logic.
 */
export default abstract class System {
    protected ecsManager?: EcsManager;

    #hasStarted: boolean;

    public readonly filter: ComponentClass[];

    #lastUpdateTime: number;

    #tps: number;

    /**
     * Create a new system with the given component group filter and the given tps
     */
    protected constructor(filter: ComponentClass[], tps?: number) {
        this.filter = filter;
        this.#lastUpdateTime = -1;
        this.#tps = tps ?? 60;
        this.#hasStarted = false;
    }

    /**
     * Called every frame, you should not call this method directly but instead use the {@see onLoop} method
     */
    public loop(entities: Entity[]): void {
        this.onLoop(entities, this.getDeltaTime());
        this.#lastUpdateTime = performance.now();
    }

    public async start(ecsManager: EcsManager): Promise<void> {
        this.ecsManager = ecsManager;
        this.#hasStarted = true;
        await this.onStart();
    }

    public async stop(): Promise<void> {
        this.#hasStarted = false;
        await this.onStop();
    }

    /**
     * Called when the system is added to an ecs manager
     * @param ecsManager
     */
    public onAddedToEcsManager(ecsManager: EcsManager): void {}

    /**
     * Called when the system is added to an ecs manager
     */
    public async initialize(): Promise<void> {}

    /**
     * Called when the system is ready to start
     */
    public async onStart(): Promise<void> {}

    /**
     * Called when the system is stopped
     */
    public async onStop(): Promise<void> {}

    /**
     * Called whenever an entity becomes eligible to a system
     * An entity becomes eligible when a component is added to an entity making it eligible to a group,
     * or when a new system is added and an entity was already eligible to the new system's group
     */
    public onEntityEligible(
        entity: Entity,
        lastComponentAdded: Component | undefined
    ): void {}

    /**
     * Called when an entity becomes ineligible to a system, and before it is removed from the system
     */
    public onEntityNoLongerEligible(
        entity: Entity,
        lastComponentRemoved: Component
    ): void {}

    /**
     * Called every frame
     * @param entities The entities eligible to this system
     * @param deltaTime The time since the last loop
     */
    protected abstract onLoop(entities: Entity[], deltaTime: number): void;

    /**
     * Return the time since the last update
     * @private
     */
    private getDeltaTime() {
        return performance.now() - this.#lastUpdateTime || 0;
    }

    /**
     * Return true if enough time has passed since the last update, false otherwise
     */
    public hasEnoughTimePassed(): boolean {
        return (
            this.#lastUpdateTime === -1 ||
            performance.now() - this.#lastUpdateTime >= 1000 / this.#tps
        );
    }

    public get lastUpdateTime(): number {
        return this.#lastUpdateTime;
    }

    public set lastUpdateTime(value: number) {
        this.#lastUpdateTime = value;
    }

    public get tps(): number {
        return this.#tps;
    }

    public set tps(value: number) {
        this.#tps = value;
    }

    public get hasStarted(): boolean {
        return this.#hasStarted;
    }

    public set hasStarted(value: boolean) {
        this.#hasStarted = value;
    }
}
