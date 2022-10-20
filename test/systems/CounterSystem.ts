import CounterComponent from "../components/CounterComponent";
import System from "../../src/System";
import Entity from "../../src/Entity";
import Component from "../../src/Component";

/**
 * This system keeps track of the number of times an entity became eligible
 * It also increments all counter components
 */
export default class CounterSystem extends System {
    public counter: number;

    public constructor() {
        super([CounterComponent]);
        this.counter = 0;
    }

    public onEntityEligible(
        entity: Entity,
        lastComponentAdded: Component | undefined
    ) {
        this.counter++;
    }

    protected onLoop(entities: Entity[], deltaTime: number): void {
        entities.forEach((entity) => {
            entity.getComponent(CounterComponent).increment();
        });
    }
}
