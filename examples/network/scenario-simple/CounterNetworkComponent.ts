import { Entity, NetworkComponent } from "../../../src";
import CounterComponent from "./CounterComponent";

type CounterData = {
    value: number;
};

export default class CounterNetworkComponent extends NetworkComponent<CounterData> {
    public constructor() {
        super();
    }

    public onAddedToEntity(entity: Entity): void {
        if (!entity.getComponent(CounterComponent)) {
            entity.addComponent(new CounterComponent());
        }
    }

    public accept(data: CounterData): boolean {
        return false;
    }

    public isDirty(lastData: CounterData): boolean {
        return this.#counter.value !== lastData.value;
    }

    public write(): CounterData {
        return { value: this.#counter.value };
    }

    public read(data: CounterData): void {
        this.#counter.value = data.value;
    }

    get #counter(): CounterComponent {
        const counter = this.entity?.getComponent(CounterComponent);
        if (!counter) {
            throw new Error("CounterComponent not found");
        }
        return counter;
    }
}
