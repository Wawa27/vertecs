import System from "../../../src/core/System";
import Entity from "../../../src/core/Entity";
export default class TickPerSecondSystem extends System<[]> {
    counter: number;
    constructor(tps?: number);
    protected onLoop(components: [], entities: Entity[], deltaTime: number): void;
}
