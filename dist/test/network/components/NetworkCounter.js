import CounterComponent from "../../components/CounterComponent";
import NetworkComponent from "../../../src/network/NetworkComponent";
export default class NetworkCounter extends NetworkComponent {
    #lastCount;
    constructor() {
        super();
        this.#lastCount = -1;
    }
    onAddedToEntity(entity) {
        if (!entity.findComponent(CounterComponent)) {
            entity.addComponent(new CounterComponent());
        }
    }
    accept(data) {
        return true;
    }
    read(data) {
        const counterComponent = this.entity?.findComponent(CounterComponent);
        this.#lastCount = counterComponent?.count ?? -1;
        if (!counterComponent) {
            throw new Error("CounterComponent not found");
        }
        counterComponent.count = data.count;
    }
    write() {
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
    isDirty() {
        const shouldUpdate = this.#lastCount !==
            this.entity?.findComponent(CounterComponent)?.count;
        if (shouldUpdate) {
            this.$updateTimestamp = Date.now();
            this.#lastCount =
                this.entity?.findComponent(CounterComponent)?.count ?? -1;
        }
        return shouldUpdate;
    }
}
