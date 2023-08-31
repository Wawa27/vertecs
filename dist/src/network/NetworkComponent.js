import { SerializableComponent } from "../io";
/**
 * A network component is a component that is used to synchronize data over the network.
 * Components that inherit from this class will be synchronized over the network if they are attached to a networked entity.
 */
export default class NetworkComponent extends SerializableComponent {
    $updateTimestamp;
    $forceUpdate;
    #lastData;
    #ownerId;
    #scope;
    constructor(ownerId, scope) {
        super();
        this.$updateTimestamp = -1;
        this.$forceUpdate = true;
        this.#ownerId = ownerId ?? "*";
        this.#scope = scope ?? "public";
    }
    serialize() {
        const data = {
            ...super.serialize(false),
            updateTimestamp: this.$updateTimestamp,
        };
        this.$forceUpdate = false;
        this.#lastData = data.data;
        return data;
    }
    deserialize(serializedComponent) {
        this.$updateTimestamp = serializedComponent.updateTimestamp ?? -1;
        return this.read(serializedComponent.data);
    }
    get scope() {
        return this.#scope;
    }
    set scope(value) {
        this.#scope = value;
    }
    get ownerId() {
        return this.#ownerId;
    }
    set ownerId(value) {
        this.#ownerId = value;
    }
    get forceUpdate() {
        return this.$forceUpdate;
    }
    set forceUpdate(value) {
        this.$forceUpdate = value;
    }
    get lastData() {
        return this.#lastData;
    }
    get updateTimestamp() {
        return this.$updateTimestamp;
    }
    set updateTimestamp(value) {
        this.$updateTimestamp = value ?? -1;
    }
}
