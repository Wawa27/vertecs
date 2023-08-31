import { WebSocket } from "ws";
import { EcsManager, Entity } from "../../core";
import GameState from "../GameState";
import type { CustomData } from "../GameState";
export default class ClientHandler {
    #private;
    protected ecsManager: EcsManager;
    protected $webSocket: WebSocket;
    readonly $clientEntity: Entity;
    constructor(clientEntity: Entity, ecsManager: EcsManager, webSocket: WebSocket);
    onConnect(): void;
    onDisconnect(): void;
    sendMessage(message: GameState): void;
    sendCustomData(data: any): void;
    onPrivateCustomData(data: any): void;
    get webSocket(): WebSocket;
    get forceUpdate(): boolean;
    set forceUpdate(forceUpdate: boolean);
    get clientSnapshot(): GameState | undefined;
    set clientSnapshot(snapshot: GameState | undefined);
    get clientEntity(): Entity;
    get customData(): CustomData[];
}
