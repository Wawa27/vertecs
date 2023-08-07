import { NetworkComponent } from "../../network";

type FiniteStateMachineData = {
    currentStateName: string;
};

export default class NetworkFiniteStateMachine extends NetworkComponent<FiniteStateMachineData> {
    public constructor() {
        super();
    }

    public accept(data: FiniteStateMachineData): boolean {
        return false;
    }

    public read(data: FiniteStateMachineData): void {}

    public shouldUpdate(): boolean {
        return false;
    }

    public write(): FiniteStateMachineData {
        return {
            currentStateName: "",
        };
    }
}
