import { WebSocket } from "ws";
import { EcsManager, Entity } from "../../../src/core";
import ClientHandler from "../../../src/network/server/ClientHandler";

export default class TestClientHandler extends ClientHandler {
    public constructor(
        playerEntity: Entity,
        ecsManager: EcsManager,
        webSocket: WebSocket
    ) {
        super(playerEntity, ecsManager, webSocket);
    }
}
