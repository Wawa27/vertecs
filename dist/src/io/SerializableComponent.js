import { Component } from "../core";
/**
 * A serializable component is a component that can be serialized and deserialized,
 * it is used to send components over network or to save them to a file for example
 */
export default class SerializableComponent extends Component {
    constructor(options) {
        super(options?.id);
    }
    serialize(addMetadata = false) {
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
    deserialize(serializedComponent) {
        return this.read(serializedComponent.data);
    }
}
