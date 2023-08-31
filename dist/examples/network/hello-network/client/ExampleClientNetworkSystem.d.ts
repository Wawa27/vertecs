import { ClientNetworkSystem, Entity } from "../../../../src";
export default class ExampleClientNetworkSystem extends ClientNetworkSystem {
    constructor(address: string);
    protected onConnect(): void;
    protected onDisconnect(): void;
    protected onDeletedEntity(entity: Entity): void;
    protected onNewEntity(entity: Entity): void;
}
