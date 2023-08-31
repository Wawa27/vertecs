import { Entity, System } from "../../core";
import FiniteStateMachine from "./FiniteStateMachine";

export default class FiniteStateMachineSystem extends System<
    [FiniteStateMachine]
> {
    public constructor(tps?: number) {
        super([FiniteStateMachine], tps);
    }

    public onEntityEligible(entity: Entity, components: [FiniteStateMachine]) {
        const [finiteStateMachine] = components;

        finiteStateMachine.setNextState(finiteStateMachine.initialStateName);
    }

    protected onLoop(
        components: [FiniteStateMachine][],
        entities: Entity[],
        deltaTime: number
    ): void {}
}
