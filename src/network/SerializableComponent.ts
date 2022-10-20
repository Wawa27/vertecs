import { Component } from "../core";

export default abstract class SerializableComponent<T> extends Component {
    protected constructor() {
        super();
    }

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
