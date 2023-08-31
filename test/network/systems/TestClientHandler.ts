import { WebSocket } from "ws";
import { EcsManager, Entity } from "../../../src/core";
import ClientHandler from "../../../src/network/server/ClientHandler";
import CounterComponent from "../../components/CounterComponent";
import NetworkCounter from "../components/NetworkCounter";
import { IsNetworked } from "../../../src";

export default class TestClientHandler extends ClientHandler {
    public constructor(
        clientEntity: Entity,
        ecsManager: EcsManager,
        webSocket: WebSocket
    ) {
        super(clientEntity, ecsManager, webSocket);
    }

    public onConnect() {
        this.$clientEntity.addComponent(new CounterComponent());
        this.$clientEntity.addComponent(new NetworkCounter());
        this.$clientEntity.addComponent(
            new IsNetworked(this.$clientEntity.id, "public")
        );
    }

    public onDisconnect() {
        this.$clientEntity.destroy();
    }
}
