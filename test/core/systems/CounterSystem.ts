import CounterComponent from "../../components/CounterComponent";
import Entity from "../../../src/core/Entity";
import Component from "../../../src/core/Component";
import System from "../../../src/core/System";

/**
 * This system keeps track of the number of times an entity became eligible
 * It also increments all counter components
 */
export default class CounterSystem extends System<[CounterComponent]> {
    public counter: number;

    public constructor() {
        super([CounterComponent]);
        this.counter = 0;
    }

    public onEntityEligible(entity: Entity, components: [CounterComponent]) {
        this.counter++;
    }

    protected onLoop(
        components: [CounterComponent][],
        entities: Entity[],
        deltaTime: number
    ): void {
        for (let i = 0; i < entities.length; i++) {
            const [counterComponent] = components[i];
            counterComponent.increment();
        }
    }
}
