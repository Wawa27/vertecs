import { ClientNetworkSystem } from "../../../src";
export default class TestClientNetworkSystem extends ClientNetworkSystem {
    #isConnected;
    #newEntities;
    #lastCustomData;
    constructor(allowedNetworkComponents, address) {
        super(allowedNetworkComponents, address);
        this.#isConnected = false;
        this.#newEntities = [];
    }
    onConnect() {
        this.#isConnected = true;
    }
    onDisconnect() {
        this.#isConnected = false;
    }
    onCustomData(customPrivateData) {
        this.#lastCustomData = customPrivateData;
    }
    onNewEntity(entity) {
        this.#newEntities.push(entity);
    }
    onDeletedEntity(entity) {
        this.#newEntities = this.#newEntities.filter((newEntity) => newEntity.id !== entity.id);
    }
    get lastCustomData() {
        return this.#lastCustomData;
    }
    get isConnected() {
        return this.#isConnected;
    }
    set isConnected(value) {
        this.#isConnected = value;
    }
    get entities() {
        return this.#newEntities;
    }
    set entities(value) {
        this.#newEntities = value;
    }
    get serverSnapshot() {
        return this.$serverSnapshot;
    }
    set serverSnapshot(value) {
        this.$serverSnapshot = value;
    }
}
