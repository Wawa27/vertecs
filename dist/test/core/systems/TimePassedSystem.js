import System from "../../../src/core/System";
export default class TimePassedSystem extends System {
    timePassed;
    constructor() {
        super([]);
        this.timePassed = 0;
    }
    onLoop(components, entities, deltaTime) {
        this.timePassed = deltaTime;
    }
}
