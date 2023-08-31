import PongServerNetworkSystem from "./PongServerNetworkSystem";
import Velocity from "../shared/Velocity";
import { EcsManager, IsNetworked, NetworkTransform, System, Transform, } from "../../../../src";
import NetworkVelocity from "../shared/NetworkVelocity";
const ecsManager = new EcsManager();
const ball = ecsManager.createEntity();
ball.addComponents(new Transform([0, 0, 0], undefined, [0.5, 0.5, 0.5]), new Velocity(), new NetworkTransform(), new NetworkVelocity(), new IsNetworked());
ecsManager.addSystem(new PongServerNetworkSystem());
ecsManager.addSystem(new (class extends System {
    constructor() {
        super([Velocity, Transform]);
    }
    onLoop(components, entities, deltaTime) {
        entities.forEach((entity) => {
            const velocity = entity.getComponent(Velocity);
            const transform = entity.getComponent(Transform);
            if (!velocity || !transform) {
                throw new Error("Velocity or Transform not found");
            }
        });
    }
})());
ecsManager.start();
