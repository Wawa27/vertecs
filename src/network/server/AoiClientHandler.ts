import { WebSocket } from "ws";
import { EcsManager } from "../../core";
import ClientHandler from "./ClientHandler";
import SerializedNetworkEntity from "../SerializedNetworkEntity";
import ServerNetworkSystem from "./ServerNetworkSystem";

/**
 * A {@link ClientHandler} variant that supports area-of-interest (AOI)
 * filtering. The server decides which entities each client should currently
 * receive and calls {@link updateRelevance} every tick:
 *
 * - Entities leaving the client's AOI are marked destroyed so the client drops
 *   them.
 * - Entities entering the AOI are returned so the server can send their full
 *   state and let the client spawn them.
 *
 * The full game state is **not** bootstrapped on connect — entities stream in
 * incrementally as they enter the client's area of interest.
 */
export default class AoiClientHandler extends ClientHandler {
    #relevantEntityIds: Set<string>;

    public constructor(
        ecsManager: EcsManager,
        webSocket: WebSocket,
        serverNetworkSystem: ServerNetworkSystem
    ) {
        super(ecsManager, webSocket, serverNetworkSystem);
        this.#relevantEntityIds = new Set();
    }

    public override onConnect(): void {
        // Do not copy the whole game state on connect. Entities are streamed
        // in as they enter the client's area of interest.
    }

    public get relevantEntityIds(): Set<string> {
        return this.#relevantEntityIds;
    }

    public isEntityRelevant(entityId: string): boolean {
        return this.#relevantEntityIds.has(entityId);
    }

    /**
     * Replaces the client's area-of-interest set. Entities that left the set
     * are marked destroyed so the client drops them. Returns the ids of
     * entities that just entered the set so the server can send their full
     * state to let the client spawn them.
     */
    public updateRelevance(relevantEntityIds: Iterable<string>): string[] {
        const next = new Set(relevantEntityIds);
        const entered = [...next].filter(
            (id) => !this.#relevantEntityIds.has(id)
        );
        const removed = [...this.#relevantEntityIds].filter(
            (id) => !next.has(id)
        );
        removed.forEach((id) => {
            this.sendEntity(
                new SerializedNetworkEntity(id, new Map(), true, [])
            );
        });
        this.#relevantEntityIds = next;
        return entered;
    }
}
