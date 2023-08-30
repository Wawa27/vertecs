import { ClientNetworkSystem, Entity } from "../../../../src";
export default class PongClientNetworkSystem extends ClientNetworkSystem {
    constructor();
    onConnect(): void;
    protected onNewEntity(entity: Entity): void;
    protected onDeletedEntity(entity: Entity): void;
    protected onDisconnect(): void;
}
