import System from "../../../src/core/System";
export default class TickPerSecondSystem extends System {
    counter;
    constructor(tps) {
        super([], tps);
        this.counter = 0;
    }
    onLoop(components, entities, deltaTime) {
        this.counter++;
    }
}
