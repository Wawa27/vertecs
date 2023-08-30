import { Entity, System } from "../../core";
import FiniteStateMachine from "./FiniteStateMachine";
export default class FiniteStateMachineSystem extends System<[
    FiniteStateMachine
]> {
    constructor(tps?: number);
    onEntityEligible(entity: Entity, components: [FiniteStateMachine]): void;
    protected onLoop(components: [FiniteStateMachine][], entities: Entity[], deltaTime: number): void;
}
