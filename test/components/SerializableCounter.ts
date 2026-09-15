import { SerializableComponent } from "../../src";

export default class SerializableCounter extends SerializableComponent<number> {
    #count: number;

    public constructor(count = 0) {
        super();
        this.#count = count;
    }

    public get count(): number {
        return this.#count;
    }

    public set count(value: number) {
        this.#count = value;
    }

    public write(): number {
        return this.#count;
    }

    public read(data: number): void {
        this.#count = data;
    }

    public clone(): SerializableCounter {
        return new SerializableCounter(this.#count);
    }
}
