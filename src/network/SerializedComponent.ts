export default class SerializedComponent<T> {
    #data: T;

    public constructor(data: T) {
        this.#data = data;
    }

    public get data(): T {
        return this.#data;
    }

    public set data(value: T) {
        this.#data = value;
    }
}
