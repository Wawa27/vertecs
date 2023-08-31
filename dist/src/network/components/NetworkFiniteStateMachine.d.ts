import { NetworkComponent } from "../index";
export default class NetworkFiniteStateMachine extends NetworkComponent<string> {
    constructor();
    accept(stateName: string): boolean;
    isDirty(lastStateName?: string): boolean;
    write(): string;
    read(stateName: string): void;
    clone(): NetworkFiniteStateMachine;
}
