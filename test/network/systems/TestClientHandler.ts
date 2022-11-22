import { WebSocket } from "ws";
import ClientHandler from "../../../src/network/server/ClientHandler";
import { EcsManager } from "../../../src/core";

export default class TestClientHandler extends ClientHandler {
    public constructor(ecsManager: EcsManager, webSocket: WebSocket) {
        super(ecsManager, webSocket);
    }
}
