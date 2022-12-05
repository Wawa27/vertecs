import { WebSocket } from "ws";
import Message from "./Message";
import { EcsManager } from "../core";

export default class ClientHandler {
    protected ecsManager: EcsManager;

    protected webSocket: WebSocket;

    public constructor(ecsManager: EcsManager, webSocket: WebSocket) {
        this.ecsManager = ecsManager;
        this.webSocket = webSocket;
    }

    public onConnect(): void {}

    public sendMessage(message: Message): void {
        this.webSocket.send(JSON.stringify(message));
    }
}
