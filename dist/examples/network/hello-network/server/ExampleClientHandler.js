import { Entity, ClientHandler, IsNetworked, } from "../../../../src";
import PositionComponent from "../PositionComponent";
import PositionComponentSynchronizer from "../PositionComponentSynchronizer";
export default class ExampleClientHandler extends ClientHandler {
    constructor(playerEntity, ecsManager, webSocket) {
        super(playerEntity, ecsManager, webSocket);
    }
    onConnect() {
        // for this example, we'll add a new entity with a position component for each client that connects
        const entity = new Entity();
        this.ecsManager.addEntity(entity);
        entity.addComponent(new PositionComponent(4, 4));
        entity.addComponent(new PositionComponentSynchronizer());
        entity.addComponent(new IsNetworked());
    }
}
