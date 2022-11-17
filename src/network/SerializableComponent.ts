import { Component } from "../core";

/**
 * A serializable component is a component that can be serialized and deserialized,
 * it is used to send components over the network or to save them to a file for example
 */
export default abstract class SerializableComponent<T> extends Component {
    #isPrivate: boolean;

    protected constructor() {
        super();
        this.#isPrivate = false;
    }

    /**
     * Server-side only. Return true if the component can be updated from the client.
     * @param data
     */
    public abstract accept(data: T): boolean;

    /**
     * Check for data synchronization, return true if the data is dirty and need to be sent over the network
     */
    public abstract isDirty(): boolean;

    /**
     * Serialize the component's data into a json object that can be sent over the network
     */
    public abstract serialize(): T;

    /**
     * Deserialize the json object, the data should come from a trusted source
     * @param data
     */
    public abstract deserialize(data: T): void;
}
