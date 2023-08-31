import ClientHandler from "../../../src/network/server/ClientHandler";
import CounterComponent from "../../components/CounterComponent";
import NetworkCounter from "../components/NetworkCounter";
import { IsNetworked } from "../../../src";
export default class TestClientHandler extends ClientHandler {
    constructor(clientEntity, ecsManager, webSocket) {
        super(clientEntity, ecsManager, webSocket);
    }
    onConnect() {
        this.$clientEntity.addComponent(new CounterComponent());
        this.$clientEntity.addComponent(new NetworkCounter());
        this.$clientEntity.addComponent(new IsNetworked(this.$clientEntity.id, "public"));
    }
    onDisconnect() {
        this.$clientEntity.destroy();
    }
}
