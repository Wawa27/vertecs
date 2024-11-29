import { WebSocket } from "ws";
import { EcsManager } from "../../../src/core";
import ClientHandler from "../../../src/network/server/ClientHandler";
import CounterComponent from "../../components/CounterComponent";
import NetworkCounter from "../components/NetworkCounter";
import { IsNetworked, ServerNetworkSystem } from "../../../src";

export default class TestClientHandler extends ClientHandler {
    public constructor(
        ecsManager: EcsManager,
        webSocket: WebSocket,
        serverNetworkSystem: ServerNetworkSystem
    ) {
        super(ecsManager, webSocket, serverNetworkSystem);
    }

    public onConnect() {
        super.onConnect();

        this.$clientEntity.addComponent(new CounterComponent());
        this.$clientEntity.addComponent(new NetworkCounter());
        this.$clientEntity.addComponent(
            new IsNetworked(this.$clientEntity.id, "public")
        );
    }

    public onDisconnect() {
        super.onDisconnect();
    }
}
