import { WebSocket } from "ws";
import { EcsManager, Entity } from "../../core";
import GameState from "../GameState";
import type { CustomData } from "../GameState";

export default class ClientHandler {
    protected ecsManager: EcsManager;

    protected $webSocket: WebSocket;

    readonly #privateData: CustomData[];

    readonly $clientEntity: Entity;

    #clientSnapshot?: GameState;

    #forceUpdate: boolean;

    public constructor(
        playerEntity: Entity,
        ecsManager: EcsManager,
        webSocket: WebSocket
    ) {
        this.$clientEntity = playerEntity;
        this.ecsManager = ecsManager;
        this.$webSocket = webSocket;
        this.#forceUpdate = true;
        this.$webSocket.on("message", (data: any) => {
            this.#clientSnapshot = JSON.parse(
                data.toString(),
                GameState.reviver
            );
        });
        this.#privateData = [];
        this.#forceUpdate = true;
    }

    public onConnect(): void {}

    public onDisconnect(): void {}

    public sendMessage(message: GameState): void {
        this.webSocket.send(JSON.stringify(message));
    }

    public sendPrivateCustomData(data: any): void {
        this.privateData.push(data);
    }

    public get webSocket(): WebSocket {
        return this.$webSocket;
    }

    public get forceUpdate(): boolean {
        return this.#forceUpdate;
    }

    public set forceUpdate(forceUpdate: boolean) {
        this.#forceUpdate = forceUpdate;
    }

    public get clientSnapshot(): GameState | undefined {
        return this.#clientSnapshot;
    }

    public set clientSnapshot(snapshot: GameState | undefined) {
        this.#clientSnapshot = snapshot;
    }

    public get clientEntity(): Entity {
        return this.$clientEntity;
    }

    public get privateData(): CustomData[] {
        return this.#privateData;
    }
}
