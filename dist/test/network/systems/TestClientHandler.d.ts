import { WebSocket } from "ws";
import { EcsManager, Entity } from "../../../src/core";
import ClientHandler from "../../../src/network/server/ClientHandler";
export default class TestClientHandler extends ClientHandler {
    constructor(clientEntity: Entity, ecsManager: EcsManager, webSocket: WebSocket);
    onConnect(): void;
    onDisconnect(): void;
}
