import { vec3 } from "ts-gl-matrix";
import Velocity from "./Velocity";
import { System, Transform } from "../../../../src";
export default class VelocitySystem extends System {
    constructor() {
        super([Velocity, Transform]);
    }
    onLoop(components, entities, deltaTime) {
        for (let i = 0; i < entities.length; i++) {
            const entity = entities[i];
            const velocity = entity.getComponent(Velocity);
            const transform = entity.getComponent(Transform);
            if (!velocity || !transform) {
                throw new Error("Velocity or Transform not found");
            }
            transform.translate(vec3.fromValues(velocity.x * deltaTime, velocity.y * deltaTime, 0));
        }
    }
}
