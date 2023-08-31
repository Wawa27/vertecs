/**
 * A system loops over all entities and uses the components of the entities to perform logic.
 */
export default class System {
    ecsManager;
    #hasStarted;
    filter;
    #lastUpdateTime;
    #tps;
    #loopTime;
    $dependencies;
    #sleepTime;
    /**
     * Create a new system with the given component group filter and the given tps
     */
    constructor(filter, tps, dependencies) {
        this.filter = filter;
        this.#lastUpdateTime = -1;
        this.#tps = tps ?? 60;
        this.#hasStarted = false;
        this.#loopTime = 0;
        this.$dependencies = dependencies ?? [];
        this.#sleepTime = 0;
    }
    /**
     * Called every frame, you should not call this method directly but instead use the {@see onLoop} method
     */
    loop(components, entities) {
        this.#sleepTime -= this.getDeltaTime();
        if (this.#sleepTime > 0) {
            return;
        }
        const startLoopTime = performance.now();
        this.onLoop(components, entities, this.getDeltaTime());
        this.#loopTime = performance.now() - startLoopTime;
        this.#lastUpdateTime = performance.now();
    }
    async start(ecsManager) {
        this.ecsManager = ecsManager;
        this.#hasStarted = true;
        await this.onStart();
    }
    async stop() {
        this.#hasStarted = false;
        await this.onStop();
    }
    sleep(milliseconds) {
        this.#sleepTime = milliseconds;
    }
    /**
     * Called when the system is added to an ecs manager
     * @param ecsManager
     */
    onAddedToEcsManager(ecsManager) { }
    /**
     * Called when the system is added to an ecs manager
     */
    async initialize() { }
    /**
     * Called when the system is ready to start
     */
    async onStart() { }
    /**
     * Called when the system is stopped
     */
    async onStop() { }
    /**
     * Called whenever an entity becomes eligible to a system
     * An entity becomes eligible when a component is added to an entity making it eligible to a group,
     * or when a new system is added and an entity was already eligible to the new system's group
     */
    onEntityEligible(entity, components) { }
    /**
     * Called when an entity becomes ineligible to a system, and before it is removed from the system
     */
    onEntityNoLongerEligible(entity, components) { }
    /**
     * Return the time since the last update
     * @private
     */
    getDeltaTime() {
        return performance.now() - this.#lastUpdateTime || 0;
    }
    /**
     * Return true if enough time has passed since the last update, false otherwise
     */
    hasEnoughTimePassed() {
        return (this.#lastUpdateTime === -1 ||
            performance.now() - this.#lastUpdateTime >= 1000 / this.#tps);
    }
    get dependencies() {
        return this.$dependencies;
    }
    get lastUpdateTime() {
        return this.#lastUpdateTime;
    }
    set lastUpdateTime(value) {
        this.#lastUpdateTime = value;
    }
    get loopTime() {
        return this.#loopTime;
    }
    get tps() {
        return this.#tps;
    }
    set tps(value) {
        this.#tps = value;
    }
    get hasStarted() {
        return this.#hasStarted;
    }
    set hasStarted(value) {
        this.#hasStarted = value;
    }
}
