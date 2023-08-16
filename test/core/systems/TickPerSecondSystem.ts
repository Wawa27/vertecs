import System from "../../../src/core/System";
import Entity from "../../../src/core/Entity";

export default class TickPerSecondSystem extends System<[]> {
    public counter: number;

    public constructor(tps?: number) {
        super([], tps);
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
