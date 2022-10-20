import System from "../../src/System";
import Entity from "../../src/Entity";

export default class TickPerSecondSystem extends System {
    public counter: number;

    public constructor(tps?: number) {
        super([], tps);
        this.counter = 0;
    }

    protected onLoop(entities: Entity[], deltaTime: number): void {
        this.counter++;
    }
}
