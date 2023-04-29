import { Component } from "../core";
import SerializedComponent from "./SerializedComponent";

/**
 * A serializable component is a component that can be serialized and deserialized,
 * it is used to send components over the networking or to save them to a file for example
 */
export default abstract class SerializableComponent<T> extends Component {
    protected constructor(options?: { id?: string }) {
        super(options?.id);
    }

    /**
     * Server-side only. Return true if the component can be updated from the client.
     * @param data
     */
    public abstract accept(data: T): boolean;

    public serialize(): SerializedComponent<T> {
        return {
            id: this.id,
            className: this.constructor.name,
            data: this.write(),
        };
    }

    public deserialize(serializedComponent: SerializedComponent<T>): void {
        return this.read(serializedComponent.data);
    }

    /**
     * Serialize the component's data into a json object that can be sent over the networking
     */
    public abstract write(): T;

    /**
     * Deserialize the json object, the data should come from a trusted source
     * @param data
     */
    public abstract read(data: T): void;
}
