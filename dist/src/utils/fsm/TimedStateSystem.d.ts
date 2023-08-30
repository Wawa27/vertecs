import { Entity, System } from "../../core";
import TimedState from "./TimedState";
import FiniteStateMachine from "./FiniteStateMachine";
export default class TimedStateSystem extends System<[
    FiniteStateMachine,
    TimedState
]> {
    constructor();
    onEntityEligible(entity: Entity, components: [FiniteStateMachine, TimedState]): void;
    onLoop(components: [FiniteStateMachine, TimedState][], entities: Entity[], deltaTime: number): void;
}
