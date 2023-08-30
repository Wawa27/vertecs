import CounterComponent from "../../components/CounterComponent";
import System from "../../../src/core/System";
/**
 * This system keeps track of the number of times an entity became eligible
 * It also increments all counter components
 */
export default class CounterSystem extends System {
    counter;
    constructor() {
        super([CounterComponent]);
        this.counter = 0;
    }
    onEntityEligible(entity, components) {
        this.counter++;
    }
    onLoop(components, entities, deltaTime) {
        for (let i = 0; i < entities.length; i++) {
            const [counterComponent] = components[i];
            counterComponent.increment();
        }
    }
}
