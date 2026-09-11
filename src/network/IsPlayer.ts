import NetworkComponent from "./network.component";

export default class IsPlayer extends NetworkComponent<undefined> {
    public constructor() {
        super();
    }

    read(data: undefined): void {}

    write(): undefined {
        return undefined;
    }

    accept(data: undefined): boolean {
        return false;
    }

    isDirty(lastData: undefined): boolean {
        return false;
    }
}
