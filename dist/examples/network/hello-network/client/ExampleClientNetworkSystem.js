import allowedNetworkComponents from "../SharedConfiguration";
import { ClientNetworkSystem } from "../../../../src";
export default class ExampleClientNetworkSystem extends ClientNetworkSystem {
    constructor(address) {
        super(allowedNetworkComponents, address);
    }
    onConnect() { }
    onDisconnect() { }
    onDeletedEntity(entity) { }
    onNewEntity(entity) { }
}
