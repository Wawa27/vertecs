import System from "../../../src/core/System";
import Entity from "../../../src/core/Entity";

/**
 * System that tracks the number of times it has been updated
 */
export default class CounterUpdateSystem extends System<[]> {
    public counter: number;

    public constructor() {
        super([]);
        this.counter = 0;
    }

    protected onLoop(
        components: [],
        entities: Entity[],
        deltaTime: number
    ): void {
        this.counter++;
    }
}
