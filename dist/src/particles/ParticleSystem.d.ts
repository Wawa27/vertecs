import { EcsManager, Entity, System } from "../core";
import Particle from "./Particle";
import ParticleEmitter from "./ParticleEmitter";
import { Transform } from "../math";
import { ThreeObject3D } from "../threejs";
export default class ParticleSystem extends System<[
    Particle,
    Transform,
    ThreeObject3D
]> {
    constructor();
    onAddedToEcsManager(ecsManager: EcsManager): void;
    protected onLoop(components: [Particle, Transform, ThreeObject3D][], entities: Entity[], deltaTime: number): void;
}
export declare class ParticleEmitterSystem extends System<[ParticleEmitter]> {
    constructor();
    onEntityEligible(entity: Entity, components: [ParticleEmitter]): void;
    protected onLoop(components: [ParticleEmitter][], entities: Entity[], deltaTime: number): void;
}
