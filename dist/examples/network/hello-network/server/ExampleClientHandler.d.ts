import { WebSocket } from "ws";
import { Entity, EcsManager, ClientHandler } from "../../../../src";
export default class ExampleClientHandler extends ClientHandler {
    constructor(playerEntity: Entity, ecsManager: EcsManager, webSocket: WebSocket);
    onConnect(): void;
}
