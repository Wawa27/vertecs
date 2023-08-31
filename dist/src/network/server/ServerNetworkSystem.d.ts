import { WebSocket } from "ws";
import { EcsManager, Entity } from "../../core";
import ClientHandler from "./ClientHandler";
import NetworkSystem from "../NetworkSystem";
import type { ComponentClass } from "../../core/Component";
import { SerializedNetworkComponent } from "../NetworkComponent";
import IsNetworked from "../IsNetworked";
type ClientHandlerConstructor = new (playerEntity: Entity, ecsManager: EcsManager, webSocket: WebSocket) => ClientHandler;
/**
 * This class is responsible for managing all the clients connected to the server.
 */
export default class ServerNetworkSystem extends NetworkSystem {
    #private;
    protected $clientHandlers: ClientHandler[];
    constructor(allowedNetworkComponents: ComponentClass[], clientHandlerConstructor: ClientHandlerConstructor, tps?: number);
    onStart(): Promise<void>;
    onStop(): Promise<void>;
    onEntityEligible(entity: Entity, components: [IsNetworked]): void;
    onEntityNoLongerEligible(entity: Entity, components: [IsNetworked]): void;
    protected onLoop(components: [IsNetworked][], entities: Entity[], deltaTime: number): void;
    deserializeComponent(networkComponent: SerializedNetworkComponent<any>, targetEntity: Entity): void;
    /**
     * Broadcasts custom data to all clients.
     * @param data
     */
    broadcastCustomData(data: any): void;
    sendCustomDataToClient(clientId: string, data: any): void;
}
export {};
