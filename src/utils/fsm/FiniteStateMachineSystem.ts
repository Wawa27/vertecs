import { Entity, System } from "../../core";
import FiniteStateMachine from "./FiniteStateMachine";

export default class FiniteStateMachineSystem extends System<
    [FiniteStateMachine]
> {
    public constructor(tps?: number) {
        super([FiniteStateMachine], tps);
    }

    protected onLoop(
        components: [FiniteStateMachine][],
        entities: Entity[],
        deltaTime: number
    ): void {
        for (let i = 0; i < components.length; i++) {
            const [finiteStateMachine] = components[i];
            finiteStateMachine.onLoop(deltaTime);
        }
    }
}
