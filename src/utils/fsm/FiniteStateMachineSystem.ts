import { Entity, System } from "../../core";
import FiniteStateMachine from "./FiniteStateMachine";

export default class FiniteStateMachineSystem extends System {
    public constructor(tps?: number) {
        super([FiniteStateMachine], tps);
    }

    protected onLoop(entities: Entity[], deltaTime: number): void {
        entities.forEach((entity) => {
            entity.getComponent(FiniteStateMachine)?.onLoop(deltaTime);
        });
    }
}
