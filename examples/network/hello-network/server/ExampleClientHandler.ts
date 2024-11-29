import { WebSocket } from "ws";
import {
    ClientHandler,
    EcsManager,
    Entity,
    IsNetworked,
    ServerNetworkSystem,
} from "../../../../src";
import PositionComponent from "../PositionComponent";
import PositionComponentSynchronizer from "../PositionComponentSynchronizer";

export default class ExampleClientHandler extends ClientHandler {
    public constructor(
        ecsManager: EcsManager,
        webSocket: WebSocket,
        serverNetworkSystem: ServerNetworkSystem
    ) {
        super(ecsManager, webSocket, serverNetworkSystem);
    }

    public onConnect() {
        // for this example, we'll add a new entity with a position component for each client that connects

        const positionComponent = new PositionComponent(
            Math.random(),
            Math.random()
        );
        this.$clientEntity.addComponent(positionComponent);

        console.log(positionComponent.x);
        console.log(positionComponent.y);

        this.$clientEntity.addComponent(new PositionComponentSynchronizer());
        this.$clientEntity.addComponent(new IsNetworked());
    }
}
