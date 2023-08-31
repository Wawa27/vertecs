import { System } from "../core";
import { Transform } from "../math";
export default class NetworkInterpolationSystem extends System {
    #networkSystem;
    constructor(allowedNetworkComponents, networkSystem) {
        super(allowedNetworkComponents, 60);
        this.#networkSystem = networkSystem;
    }
    onLoop(components, entities, deltaTime) {
        entities.forEach((entity) => {
            const transform = entity.getComponent(Transform);
            if (!transform) {
                throw new Error("Transform not found");
            }
        });
    }
}
