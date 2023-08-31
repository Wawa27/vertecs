import { System } from "../../core";
import TimedState from "./TimedState";
import FiniteStateMachine from "./FiniteStateMachine";
export default class TimedStateSystem extends System {
    constructor() {
        super([FiniteStateMachine, TimedState]);
    }
    onEntityEligible(entity, components) {
        const [finiteStateMachine, timedState] = components;
        timedState.startTime = new Date().getTime();
    }
    onLoop(components, entities, deltaTime) {
        for (let i = 0; i < components.length; i++) {
            const [finiteStateMachine, timedState] = components[i];
            if (timedState.repeat > 0 && timedState.nextStateName) {
                if (new Date().getTime() - timedState.startTime >
                    timedState.duration) {
                    finiteStateMachine?.setNextState(timedState.nextStateName);
                }
            }
        }
    }
}
