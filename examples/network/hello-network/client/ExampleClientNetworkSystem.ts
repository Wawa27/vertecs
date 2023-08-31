import allowedNetworkComponents from "../SharedConfiguration";
import { ClientNetworkSystem, Entity } from "../../../../src";

export default class ExampleClientNetworkSystem extends ClientNetworkSystem {
    public constructor(address: string) {
        super(allowedNetworkComponents, address);
    }

    protected onConnect(): void {}

    protected onDisconnect(): void {}

    protected onDeletedEntity(entity: Entity): void {}

    protected onNewEntity(entity: Entity): void {}
}
