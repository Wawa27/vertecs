import { WebSocket } from "ws";
import ClientHandler from "../../../src/networking/server/ClientHandler";
import { EcsManager } from "../../../src/core";

export default class TestClientHandler extends ClientHandler {
    public constructor(ecsManager: EcsManager, webSocket: WebSocket) {
        super(ecsManager, webSocket);
    }
}
