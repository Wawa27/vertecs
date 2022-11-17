import { WebSocket } from "ws";
import Message from "../Message";

export default class ClientHandler {
    protected webSocket: WebSocket;

    public constructor(webSocket: WebSocket) {
        this.webSocket = webSocket;
    }

    public onConnect(): void {}

    public sendMessage(message: Message): void {
        this.webSocket.send(JSON.stringify(message));
    }
}
