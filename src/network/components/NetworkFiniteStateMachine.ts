import { NetworkComponent } from "../index";
import FiniteStateMachine from "../../utils/fsm/FiniteStateMachine";

export default class NetworkFiniteStateMachine extends NetworkComponent<string> {
    public constructor() {
        super();
    }

    public accept(stateName: string): boolean {
        // TODO: Check if state exists and if the transition is valid
        return true;
    }

    public isDirty(lastStateName?: string): boolean {
        const finiteStateMachine =
            this.entity?.getComponent(FiniteStateMachine);

        return lastStateName !== finiteStateMachine?.currentStateName;
    }

    public write() {
        const finiteStateMachine =
            this.entity?.getComponent(FiniteStateMachine);
        return finiteStateMachine?.currentStateName ?? "";
    }

    public read(stateName: string): void {
        const finiteStateMachine =
            this.entity?.getComponent(FiniteStateMachine);

        if (!finiteStateMachine) return;

        finiteStateMachine.setNextState(stateName);
    }

    public clone(): NetworkFiniteStateMachine {
        return new NetworkFiniteStateMachine();
    }
}
