import { NetworkComponent } from "../index";
import FiniteStateMachine from "../../utils/fsm/FiniteStateMachine";
export default class NetworkFiniteStateMachine extends NetworkComponent {
    constructor() {
        super();
    }
    accept(stateName) {
        // TODO: Check if state exists and if the transition is valid
        return true;
    }
    isDirty(lastStateName) {
        const finiteStateMachine = this.entity?.getComponent(FiniteStateMachine);
        return lastStateName !== finiteStateMachine?.currentStateName;
    }
    write() {
        const finiteStateMachine = this.entity?.getComponent(FiniteStateMachine);
        return finiteStateMachine?.currentStateName ?? "";
    }
    read(stateName) {
        const finiteStateMachine = this.entity?.getComponent(FiniteStateMachine);
        if (!finiteStateMachine)
            return;
        finiteStateMachine.setNextState(stateName);
    }
    clone() {
        return new NetworkFiniteStateMachine();
    }
}
