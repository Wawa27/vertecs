/**
 * The json representation of an entity
 */
export default class SerializedEntity {
    $id;
    $components;
    $name;
    $destroyed;
    $parent;
    $prefabName;
    constructor(id, components, name, destroyed, parent, prefabName) {
        this.$id = id;
        this.$components = components;
        this.$name = name;
        this.$destroyed = destroyed;
        this.$parent = parent;
        this.$prefabName = prefabName;
    }
    toJSON() {
        return {
            id: this.$id,
            name: this.$name,
            components: Array.from(this.$components.entries()),
            destroyed: this.$destroyed,
            parent: this.$parent,
            prefabName: this.$prefabName,
        };
    }
    static reviver(key, value) {
        if (key === "components") {
            return new Map(value);
        }
        return value;
    }
    // TODO: Move to network entity
    get destroyed() {
        return this.$destroyed;
    }
    set destroyed(value) {
        this.$destroyed = value;
    }
    get parent() {
        return this.$parent;
    }
    set parent(value) {
        this.$parent = value;
    }
    get prefabName() {
        return this.$prefabName;
    }
    get id() {
        return this.$id;
    }
    get name() {
        return this.$name;
    }
    get components() {
        return this.$components;
    }
}
