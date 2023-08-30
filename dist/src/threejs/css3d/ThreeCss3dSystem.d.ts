import { Entity, System } from "../../core";
import ThreeCss3dComponent from "./ThreeCss3dComponent";
import ThreeSystem from "../ThreeSystem";
import { Transform } from "../../math";
export default class ThreeCss3dSystem extends System<[
    ThreeCss3dComponent,
    Transform
]> {
    #private;
    constructor(threeSystem: ThreeSystem, tps?: number);
    onEntityEligible(entity: Entity, components: [ThreeCss3dComponent, Transform]): void;
    onEntityNoLongerEligible(entity: Entity, components: [ThreeCss3dComponent, Transform]): void;
    protected onLoop(components: [ThreeCss3dComponent, Transform][], entities: Entity[], deltaTime: number): void;
}
