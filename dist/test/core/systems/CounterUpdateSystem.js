import System from "../../../src/core/System";
/**
 * System that tracks the number of times it has been updated
 */
export default class CounterUpdateSystem extends System {
    counter;
    constructor() {
        super([]);
        this.counter = 0;
    }
    onLoop(components, entities, deltaTime) {
        this.counter++;
    }
}
