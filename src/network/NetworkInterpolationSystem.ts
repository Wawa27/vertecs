import { Entity, System } from "../core";
import NetworkSystem from "./NetworkSystem";
import { Transform } from "../math";
import { ComponentClass } from "../core/Component";
import IsNetworked from "./IsNetworked";

export default class NetworkInterpolationSystem extends System<[IsNetworked]> {
    #networkSystem: NetworkSystem;

    public constructor(
        allowedNetworkComponents: ComponentClass[],
        networkSystem: NetworkSystem
    ) {
        super(allowedNetworkComponents, 60);

        this.#networkSystem = networkSystem;
    }

    protected onLoop(
        components: [IsNetworked][],
        entities: Entity[],
        deltaTime: number
    ): void {
        entities.forEach((entity) => {
            const transform = entity.getComponent(Transform);

            if (!transform) {
                throw new Error("Transform not found");
            }
        });
    }
}
