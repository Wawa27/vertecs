import Velocity from "./Velocity";
import { Entity, System, Transform } from "../../../../src";
export default class VelocitySystem extends System<[Velocity, Transform]> {
    constructor();
    onLoop(components: [Velocity, Transform][], entities: Entity[], deltaTime: number): void;
}
