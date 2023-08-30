import { ComponentClass } from "../../../src/core/Component";
import { Entity } from "../../../src/core";
import { ClientNetworkSystem } from "../../../src";
export default class TestClientNetworkSystem extends ClientNetworkSystem {
    #private;
    constructor(allowedNetworkComponents: ComponentClass[], address: string);
    protected onConnect(): void;
    protected onDisconnect(): void;
    protected onCustomData(customPrivateData: any): void;
    protected onNewEntity(entity: Entity): void;
    protected onDeletedEntity(entity: Entity): void;
    get lastCustomData(): any;
    get isConnected(): boolean;
    set isConnected(value: boolean);
    get entities(): Entity[];
    set entities(value: Entity[]);
    get serverSnapshot(): any;
    set serverSnapshot(value: any);
}
