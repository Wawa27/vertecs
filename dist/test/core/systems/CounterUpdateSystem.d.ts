import System from "../../../src/core/System";
import Entity from "../../../src/core/Entity";
/**
 * System that tracks the number of times it has been updated
 */
export default class CounterUpdateSystem extends System<[]> {
    counter: number;
    constructor();
    protected onLoop(components: [], entities: Entity[], deltaTime: number): void;
}
