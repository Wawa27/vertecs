import { SerializableComponent } from "../../src/io";

type CounterComponentData = {
    count: number;
};

export default class SerializableCounter extends SerializableComponent<CounterComponentData> {
    public count: number;

    public constructor(counter?: number, options?: { id?: string }) {
        super(options);
        this.count = counter || 0;
    }

    public increment() {
        this.count++;
    }

    public accept(data: CounterComponentData): boolean {
        return true;
    }

    public read(data: CounterComponentData): void {
        this.count = data.count;
    }

    public write(): CounterComponentData {
        return {
            count: this.count,
        };
    }
}
