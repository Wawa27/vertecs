import { WebGLRenderer } from "three";
import { Transform } from "../../math";
import { ThreeCamera } from "../index";
import { Entity, System } from "../../core";
export default class ThreeCameraSystem extends System<[
    ThreeCamera,
    Transform
]> {
    #private;
    constructor(renderer: WebGLRenderer, tps?: number);
    onStart(): Promise<void>;
    onEntityEligible(entity: Entity, components: [ThreeCamera, Transform]): void;
    protected onLoop(components: [ThreeCamera, Transform][], entities: Entity[], deltaTime: number): void;
    get cameraEntity(): Entity | undefined;
}
