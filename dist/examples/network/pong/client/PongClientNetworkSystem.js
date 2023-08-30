import * as console from "console";
import { BoxGeometry, Mesh, SphereGeometry } from "three";
import allowedNetworkComponents from "../shared/SharedConfiguration";
import { ClientNetworkSystem, ThreeObject3D } from "../../../../src";
import Velocity from "../shared/Velocity";
export default class PongClientNetworkSystem extends ClientNetworkSystem {
    constructor() {
        super(allowedNetworkComponents, "ws://localhost:8080", 32);
    }
    onConnect() {
        console.log("Connected to server");
    }
    onNewEntity(entity) {
        if (entity.getComponent(Velocity)) {
            entity.addComponent(new ThreeObject3D(new Mesh(new SphereGeometry(1))));
        }
        else {
            entity.addComponent(new ThreeObject3D(new Mesh(new BoxGeometry(1, 1, 1))));
        }
    }
    onDeletedEntity(entity) { }
    onDisconnect() { }
}
