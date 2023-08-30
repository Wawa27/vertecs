import { System } from "../../core";
import FiniteStateMachine from "./FiniteStateMachine";
export default class FiniteStateMachineSystem extends System {
    constructor(tps) {
        super([FiniteStateMachine], tps);
    }
    onEntityEligible(entity, components) {
        const [finiteStateMachine] = components;
        finiteStateMachine.setNextState(finiteStateMachine.initialStateName);
    }
    onLoop(components, entities, deltaTime) { }
}
