import { SerializedEntity } from "../io";
/**
 * JSON representation of an entity that is synchronized over the network.
 */
export default class NetworkEntity extends SerializedEntity {
    constructor(id, components, name, prefabName) {
        super(id, components, name, false, undefined, prefabName);
    }
    toJSON() {
        return {
            id: this.$id,
            components: Array.from(this.components.entries()),
            name: this.$name,
            destroyed: this.$destroyed,
            prefabName: this.$prefabName,
        };
    }
    static reviver(key, value) {
        if (key === "components") {
            return new Map(value);
        }
        return value;
    }
    get components() {
        return this.$components;
    }
}
