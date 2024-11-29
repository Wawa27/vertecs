import { Entity, System } from "../../core";
import TimedState from "./TimedState";
import FiniteStateMachine from "./FiniteStateMachine";

export default class TimedStateSystem extends System<
    [FiniteStateMachine, TimedState]
> {
    public constructor() {
        super([FiniteStateMachine, TimedState]);
    }

    public onEntityEligible(
        entity: Entity,
        components: [FiniteStateMachine, TimedState]
    ) {
        const [finiteStateMachine, timedState] = components;
        timedState.startTime = new Date().getTime();
    }

    public onLoop(
        components: [FiniteStateMachine, TimedState][],
        entities: Entity[],
        deltaTime: number
    ): void {
        for (let i = 0; i < components.length; i++) {
            const [finiteStateMachine, timedState] = components[i];
            if (timedState.nextStateName) {
                if (
                    new Date().getTime() - timedState.startTime >
                    timedState.duration
                ) {
                    finiteStateMachine?.setNextState(timedState.nextStateName);
                }
            }
        }
    }
}
