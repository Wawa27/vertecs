import { WebSocket } from "ws";
import ClientHandler from "../../../src/network/server/ClientHandler";
import { Entity, EcsManager } from "../../../src";
import PositionComponent from "../PositionComponent";
import PositionComponentSynchronizer from "../PositionComponentSynchronizer";

export default class ExampleClientHandler extends ClientHandler {
    public constructor(webSocket: WebSocket) {
        super(webSocket);
    }

    public onConnect() {
        // for this example, we'll add a new entity with a position component for each client that connects
        const entity = new Entity();

        EcsManager.getInstance().addEntity(entity);

        entity.addComponent(new PositionComponent(4, 4));
        entity.addComponent(new PositionComponentSynchronizer());
    }
}
