import { Scene } from "three";
import { Entity, System } from "../../core";
import ThreeLightComponent from "./ThreeLightComponent";
import { Transform } from "../../math";
export default class ThreeLightSystem extends System<[
    ThreeLightComponent,
    Transform
]> {
    #private;
    constructor(scene: Scene, tps?: number);
    onEntityEligible(entity: Entity, components: [ThreeLightComponent, Transform]): void;
    onEntityNoLongerEligible(entity: Entity, components: [ThreeLightComponent, Transform]): void;
    protected onLoop(components: [ThreeLightComponent, Transform][], entities: Entity[], deltaTime: number): void;
}
