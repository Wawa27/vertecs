import ClientHandler from "src/network/server/ClientHandler";
import { WebSocket } from "ws";

export default class TestClientHandler extends ClientHandler {
    public constructor(webSocket: WebSocket) {
        super(webSocket);
    }
}
