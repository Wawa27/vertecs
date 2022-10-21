export default class SerializedComponent<T> {
    #data: T;

    #componentId: string;

    #componentClassName: string;

    public constructor(
        data: T,
        componentId: string,
        componentClassName: string
    ) {
        this.#data = data;
        this.#componentId = componentId;
        this.#componentClassName = componentClassName;
    }

    public get componentId(): string {
        return this.#componentId;
    }

    public set componentId(value: string) {
        this.#componentId = value;
    }

    public get componentClassName(): string {
        return this.#componentClassName;
    }

    public set componentClassName(value: string) {
        this.#componentClassName = value;
    }

    public get data(): T {
        return this.#data;
    }

    public set data(value: T) {
        this.#data = value;
    }
}
