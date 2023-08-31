import WebSocket from "ws";
import { ClientHandler, EcsManager, Entity } from "../../../../src";
export default class PongNetworkClientHandler extends ClientHandler {
    constructor(player: Entity, ecsManager: EcsManager, webSocket: WebSocket);
    onConnect(): void;
}
