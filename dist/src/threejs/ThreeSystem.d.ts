import { Camera, Scene, WebGLRenderer } from "three";
import { EcsManager, Entity, System } from "../core";
import ThreeObject3D from "./ThreeObject3D";
import { Transform } from "../math";
export default class ThreeSystem extends System<[Transform, ThreeObject3D]> {
    #private;
    constructor(tps?: number);
    onAddedToEcsManager(ecsManager: EcsManager): void;
    onEntityEligible(entity: Entity, components: [Transform, ThreeObject3D]): void;
    onEntityNoLongerEligible(entity: Entity, components: [Transform, ThreeObject3D]): void;
    onStart(): Promise<void>;
    protected onLoop(components: [Transform, ThreeObject3D][], entities: Entity[], deltaTime: number): void;
    get camera(): Camera;
    get renderer(): WebGLRenderer;
    get scene(): Scene;
}
