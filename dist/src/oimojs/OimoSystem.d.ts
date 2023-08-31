import { Transform } from "../math";
import { Entity, System } from "../core";
import OimoComponent from "./OimoComponent";
export default class OimoSystem extends System<[OimoComponent, Transform]> {
    #private;
    constructor(tps?: number);
    onStart(): Promise<void>;
    onEntityEligible(entity: Entity, components: [OimoComponent, Transform]): void;
    protected onLoop(components: [OimoComponent, Transform][], entities: Entity[], deltaTime: number): void;
}
