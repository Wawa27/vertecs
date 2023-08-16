import CounterComponent from "../../components/CounterComponent";
import { Entity } from "../../../src/core";
import NetworkComponent from "../../../src/network/NetworkComponent";

type CounterComponentData = {
    count: number;
};

export default class NetworkCounter extends NetworkComponent<CounterComponentData> {
    #lastCount: number;

    public constructor() {
        super();
        this.#lastCount = -1;
    }

    public onAddedToEntity(entity: Entity) {
        if (!entity.findComponent(CounterComponent)) {
            entity.addComponent(new CounterComponent());
        }
    }

    public accept(data: CounterComponentData): boolean {
        return true;
    }

    public read(data: CounterComponentData): void {
        const counterComponent = this.entity?.findComponent(CounterComponent);

        this.#lastCount = counterComponent?.count ?? -1;

        if (!counterComponent) {
            throw new Error("CounterComponent not found");
        }
        counterComponent.count = data.count;
    }

    public write(): CounterComponentData {
        this.$updateTimestamp = Date.now();
        const counter = this.entity?.findComponent(CounterComponent);
        if (!counter) {
            throw new Error("CounterComponent not found");
        }
        const currentCount = counter.count;
        return {
            count: currentCount,
        };
    }

    public shouldUpdate(): boolean {
        const shouldUpdate =
            this.#lastCount !==
            this.entity?.findComponent(CounterComponent)?.count;

        if (shouldUpdate) {
            this.$updateTimestamp = Date.now();
            this.#lastCount =
                this.entity?.findComponent(CounterComponent)?.count ?? -1;
        }

        return shouldUpdate;
    }
}
