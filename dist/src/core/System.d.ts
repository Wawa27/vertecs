import type { ComponentClass } from "./Component";
import Component from "./Component";
import Entity from "./Entity";
import EcsManager from "./EcsManager";
type SystemConstructor<T extends Component[]> = new (...args: any[]) => System<T>;
/**
 * A system loops over all entities and uses the components of the entities to perform logic.
 */
export default abstract class System<T extends Component[] = []> {
    #private;
    protected ecsManager?: EcsManager;
    readonly filter: ComponentClass<T[number]>[];
    $dependencies: SystemConstructor<Component[]>[];
    /**
     * Create a new system with the given component group filter and the given tps
     */
    protected constructor(filter: ComponentClass<T[number]>[], tps?: number, dependencies?: SystemConstructor<Component[]>[]);
    /**
     * Called every frame, you should not call this method directly but instead use the {@see onLoop} method
     */
    loop(components: T[], entities: Entity[]): void;
    start(ecsManager: EcsManager): Promise<void>;
    stop(): Promise<void>;
    sleep(milliseconds: number): void;
    /**
     * Called when the system is added to an ecs manager
     * @param ecsManager
     */
    onAddedToEcsManager(ecsManager: EcsManager): void;
    /**
     * Called when the system is added to an ecs manager
     */
    initialize(): Promise<void>;
    /**
     * Called when the system is ready to start
     */
    onStart(): Promise<void>;
    /**
     * Called when the system is stopped
     */
    onStop(): Promise<void>;
    /**
     * Called whenever an entity becomes eligible to a system
     * An entity becomes eligible when a component is added to an entity making it eligible to a group,
     * or when a new system is added and an entity was already eligible to the new system's group
     */
    onEntityEligible(entity: Entity, components: T): void;
    /**
     * Called when an entity becomes ineligible to a system, and before it is removed from the system
     */
    onEntityNoLongerEligible(entity: Entity, components: T): void;
    /**
     * Called every frame
     * @param components
     * @param entities
     * @param deltaTime The time since the last loop
     */
    protected abstract onLoop(components: T[], entities: Entity[], deltaTime: number): void;
    /**
     * Return the time since the last update
     * @private
     */
    private getDeltaTime;
    /**
     * Return true if enough time has passed since the last update, false otherwise
     */
    hasEnoughTimePassed(): boolean;
    get dependencies(): SystemConstructor<Component[]>[];
    get lastUpdateTime(): number;
    set lastUpdateTime(value: number);
    get loopTime(): number;
    get tps(): number;
    set tps(value: number);
    get hasStarted(): boolean;
    set hasStarted(value: boolean);
}
export {};
