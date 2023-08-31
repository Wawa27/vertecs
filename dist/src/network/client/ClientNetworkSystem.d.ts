import type { ComponentClass } from "../../core/Component";
import Entity from "../../core/Entity";
import GameState from "../GameState";
import NetworkSystem from "../NetworkSystem";
import NetworkEntity from "../NetworkEntity";
import IsNetworked from "../IsNetworked";
/**
 * Entry point for the client-side networking.
 * This system is responsible for sending and receiving entities over the networking.
 * It must be extended to provide a custom listener for various events.
 */
export default abstract class ClientNetworkSystem extends NetworkSystem {
    #private;
    protected $serverSnapshot?: GameState;
    protected constructor(allowedNetworkComponents: ComponentClass[], address: string, tps?: number);
    onStart(): Promise<void>;
    onStop(): Promise<void>;
    onEntityEligible(entity: Entity): void;
    protected onLoop(components: [IsNetworked][], entities: Entity[], deltaTime: number): void;
    private setup;
    deserializeEntity(networkEntity: NetworkEntity): void;
    /**
     * Serialize the entity only if it is networked and owned by the client.
     * @param entity
     */
    serializeEntity(entity: Entity): NetworkEntity | undefined;
    sendCustomPrivateData(data: any): void;
    /**
     * Called when the client is connected to the server.
     * @protected
     */
    protected abstract onConnect(): void;
    /**
     * Called when the client is disconnected from the server.
     * @protected
     */
    protected abstract onDisconnect(): void;
    /**
     * Called when the client received a new entity from the server.
     * @protected
     */
    protected abstract onNewEntity(entity: Entity): void;
    /**
     * Called when an entity is deleted from the server.
     * @protected
     */
    protected abstract onDeletedEntity(entity: Entity): void;
    protected onCustomData(customPrivateData: any): void;
    get networkId(): string | undefined;
}
