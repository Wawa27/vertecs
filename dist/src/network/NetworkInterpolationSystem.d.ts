import { Entity, System } from "../core";
import NetworkSystem from "./NetworkSystem";
import { ComponentClass } from "../core/Component";
import IsNetworked from "./IsNetworked";
export default class NetworkInterpolationSystem extends System<[IsNetworked]> {
    #private;
    constructor(allowedNetworkComponents: ComponentClass[], networkSystem: NetworkSystem);
    protected onLoop(components: [IsNetworked][], entities: Entity[], deltaTime: number): void;
}
