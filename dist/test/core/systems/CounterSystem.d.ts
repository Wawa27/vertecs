import CounterComponent from "../../components/CounterComponent";
import Entity from "../../../src/core/Entity";
import System from "../../../src/core/System";
/**
 * This system keeps track of the number of times an entity became eligible
 * It also increments all counter components
 */
export default class CounterSystem extends System<[CounterComponent]> {
    counter: number;
    constructor();
    onEntityEligible(entity: Entity, components: [CounterComponent]): void;
    protected onLoop(components: [CounterComponent][], entities: Entity[], deltaTime: number): void;
}
