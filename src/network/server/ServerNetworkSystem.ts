import { WebSocket, WebSocketServer } from "ws";
import { Entity, System } from "../../core";
import ClientHandler from "./ClientHandler";

type ClientHandlerConstructor = new (webSocket: WebSocket) => ClientHandler;

export default class ServerNetworkSystem extends System {
    #webSocketServer?: WebSocketServer;

    #clientHandlers: ClientHandler[];

    readonly #ClientHandlerConstructor: ClientHandlerConstructor;

    public constructor(clientHandlerConstructor: new () => ClientHandler) {
        super([]);

        this.#ClientHandlerConstructor = clientHandlerConstructor;
        this.#clientHandlers = [];
    }

    public async onStart(): Promise<void> {
        this.#webSocketServer = new WebSocketServer({
            port: 10025,
            perMessageDeflate: {
                zlibDeflateOptions: {
                    chunkSize: 1024,
                    memLevel: 7,
                    level: 3,
                },
                zlibInflateOptions: {
                    chunkSize: 10 * 1024,
                },
                clientNoContextTakeover: true,
                serverNoContextTakeover: true,
                serverMaxWindowBits: 10,
                concurrencyLimit: 10,
                threshold: 1024,
            },
        });

        this.#webSocketServer.on("connection", (webSocket) => {
            this.#clientHandlers.push(
                new this.#ClientHandlerConstructor(webSocket)
            );
        });
    }

    protected onLoop(entities: Entity[], deltaTime: number): void {}
}
