import { Component } from "../core";
import type SerializedComponent from "./SerializedComponent";

/**
 * A serializable component is a component that can be serialized and deserialized,
 * it is used to send components over network or to save them to a file for example
 */
export default abstract class SerializableComponent<T> extends Component {
    protected constructor(options?: { id?: string }) {
        super(options?.id);
    }

    public serialize(addMetadata = false): SerializedComponent<T> {
        if (!addMetadata) {
            return {
                className: this.constructor.name,
                data: this.write(),
            };
        }
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
