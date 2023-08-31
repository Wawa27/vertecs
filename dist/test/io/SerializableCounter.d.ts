import { SerializableComponent } from "../../src/io";
type CounterComponentData = {
    count: number;
};
export default class SerializableCounter extends SerializableComponent<CounterComponentData> {
    count: number;
    constructor(counter?: number, options?: {
        id?: string;
    });
    increment(): void;
    accept(data: CounterComponentData): boolean;
    read(data: CounterComponentData): void;
    write(): CounterComponentData;
}
export {};
