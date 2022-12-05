import { WebSocket } from "ws";
import { EcsManager } from "../../../src/core";
import ClientHandler from "../../../src/network/ClientHandler";

export default class TestClientHandler extends ClientHandler {
    public constructor(ecsManager: EcsManager, webSocket: WebSocket) {
        super(ecsManager, webSocket);
    }
}
