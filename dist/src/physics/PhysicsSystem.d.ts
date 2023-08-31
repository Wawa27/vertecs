import Body from "./bodies/Body";
import Ray from "./Ray";
import { Entity, System } from "../core";
import { Transform } from "../math";
export default class PhysicsSystem extends System<[Body, Transform]> {
    #private;
    constructor(tps?: number);
    onEntityEligible(entity: Entity, components: [Body, Transform]): void;
    onEntityNoLongerEligible(entity: Entity, components: [Body, Transform]): void;
    protected onLoop(components: [Body, Transform][], entities: Entity[], deltaTime: number): void;
    findEntitiesFromRaycast(ray: Ray): Entity[];
    private applyGravity;
}
