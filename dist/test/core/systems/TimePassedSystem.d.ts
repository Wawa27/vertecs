import System from "../../../src/core/System";
import Entity from "../../../src/core/Entity";
export default class TimePassedSystem extends System<[]> {
    timePassed: number;
    constructor();
    protected onLoop(components: [], entities: Entity[], deltaTime: number): void;
}
