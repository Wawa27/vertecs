import { WebSocket } from "ws";
import {
    Entity,
    EcsManager,
    ClientHandler,
    IsNetworked,
} from "../../../../src";
import PositionComponent from "../PositionComponent";
import PositionComponentSynchronizer from "../PositionComponentSynchronizer";

export default class ExampleClientHandler extends ClientHandler {
    public constructor(
        playerEntity: Entity,
        ecsManager: EcsManager,
        webSocket: WebSocket
    ) {
        super(playerEntity, ecsManager, webSocket);
    }

    public onConnect() {
        // for this example, we'll add a new entity with a position component for each client that connects
        const entity = new Entity();

        this.ecsManager.addEntity(entity);

        entity.addComponent(new PositionComponent(4, 4));
        entity.addComponent(new PositionComponentSynchronizer());
        entity.addComponent(new IsNetworked());
    }
}
