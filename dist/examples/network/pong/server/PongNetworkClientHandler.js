import { ClientComponent, ClientHandler, IsNetworked, NetworkCubeBody, NetworkTransform, Transform, } from "../../../../src";
import CubeBody from "../../../../src/physics/bodies/CubeBody";
import Velocity from "../shared/Velocity";
export default class PongNetworkClientHandler extends ClientHandler {
    constructor(player, ecsManager, webSocket) {
        super(player, ecsManager, webSocket);
    }
    onConnect() {
        const isPlayer2 = this.ecsManager.entities.some((entity) => entity.getComponent(ClientComponent) &&
            entity.id !== this.clientEntity.id);
        this.clientEntity.addComponents(new Transform([isPlayer2 ? -9.5 : 9.5, 0, 0], undefined, [0.25, 3, 0.25]), new NetworkTransform(), new CubeBody({
            width: 0.25,
            height: 3,
            depth: 0.25,
        }), new NetworkCubeBody(), new IsNetworked());
        const clients = this.ecsManager.entities.filter((entity) => entity.getComponent(ClientComponent));
        if (clients.length === 2) {
            setTimeout(() => {
                console.log("Starting game");
                const ball = this.ecsManager?.entities.find((entity) => entity.getComponent(Velocity));
                const ballVelocity = ball?.getComponent(Velocity);
                if (!ball || !ballVelocity) {
                    throw new Error("Ball not found");
                }
                ballVelocity.x = 0.1;
                ballVelocity.y = 0.1;
            }, 100);
        }
    }
}
