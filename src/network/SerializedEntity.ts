import SerializedComponent from "./SerializedComponent";

/**
 * The json representation of an entity that can be sent over the network
 */
export default class SerializedEntity {
    #owner?: string;

    #id: number;

    #components: SerializedComponent<any>[];

    public constructor(
        id: number,
        components: SerializedComponent<any>[],
        owner?: string
    ) {
        this.#id = id;
        this.#components = components;
        this.#owner = owner;
    }

    public get id(): number {
        return this.#id;
    }

    public set id(value: number) {
        this.#id = value;
    }

    public get components(): SerializedComponent<any>[] {
        return this.#components;
    }

    public set components(value: SerializedComponent<any>[]) {
        this.#components = value;
    }
}
