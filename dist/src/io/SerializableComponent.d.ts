import { Component } from "../core";
import type SerializedComponent from "./SerializedComponent";
/**
 * A serializable component is a component that can be serialized and deserialized,
 * it is used to send components over network or to save them to a file for example
 */
export default abstract class SerializableComponent<T> extends Component {
    protected constructor(options?: {
        id?: string;
    });
    serialize(addMetadata?: boolean): SerializedComponent<T>;
    deserialize(serializedComponent: SerializedComponent<T>): void;
    /**
     * Serialize the component's data into a json object that can be sent over the networking
     */
    abstract write(): T;
    /**
     * Deserialize the json object, the data should come from a trusted source
     * @param data
     */
    abstract read(data: T): void;
}
