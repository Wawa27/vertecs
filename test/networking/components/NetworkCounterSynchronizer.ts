import CounterComponent from "../../components/CounterComponent";
import { Entity } from "../../../src/core";
import NetworkableComponent from "../../../src/network/NetworkableComponent";

type CounterComponentData = {
    count: number;
};

export default class NetworkCounterSynchronizer extends NetworkableComponent<CounterComponentData> {
    #lastUpdate: number;

    public constructor() {
        super();
        this.#lastUpdate = Date.now();
    }

    public onAddedToEntity(entity: Entity) {
        if (!entity.findComponent(CounterComponent)) {
            entity.addComponent(new CounterComponent());
        }
    }

    public accept(data: CounterComponentData): boolean {
        return true;
    }

    public deserialize(data: CounterComponentData): void {
        const counterComponent = this.entity?.findComponent(CounterComponent);
        if (!counterComponent) {
            throw new Error("CounterComponent not found");
        }
        counterComponent.count = data.count;
    }

    public serialize(): any {
        this.#lastUpdate = Date.now();
        const counter = this.entity?.findComponent(CounterComponent);
        if (!counter) {
            throw new Error("CounterComponent not found");
        }
        const currentCount = counter.count;
        counter.count++;
        return {
            count: currentCount,
        };
    }

    public shouldUpdate(): boolean {
        return this.#lastUpdate + 1000 < Date.now();
    }
}
