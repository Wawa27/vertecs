import GameState from "../GameState";
export default class ClientHandler {
    ecsManager;
    $webSocket;
    #customData;
    $clientEntity;
    #clientSnapshot;
    #forceUpdate;
    constructor(clientEntity, ecsManager, webSocket) {
        this.$clientEntity = clientEntity;
        this.ecsManager = ecsManager;
        this.$webSocket = webSocket;
        this.#forceUpdate = true;
        this.$webSocket.on("message", (data) => {
            this.#clientSnapshot = JSON.parse(data.toString(), GameState.reviver);
        });
        this.#customData = [];
        this.#forceUpdate = true;
    }
    onConnect() { }
    onDisconnect() { }
    sendMessage(message) {
        this.webSocket.send(JSON.stringify(message));
    }
    sendCustomData(data) {
        this.customData.push(data);
    }
    onPrivateCustomData(data) { }
    get webSocket() {
        return this.$webSocket;
    }
    get forceUpdate() {
        return this.#forceUpdate;
    }
    set forceUpdate(forceUpdate) {
        this.#forceUpdate = forceUpdate;
    }
    get clientSnapshot() {
        return this.#clientSnapshot;
    }
    set clientSnapshot(snapshot) {
        this.#clientSnapshot = snapshot;
    }
    get clientEntity() {
        return this.$clientEntity;
    }
    get customData() {
        return this.#customData;
    }
}
