import { Vec3 } from "ts-gl-matrix";
import { Component, EcsManager, Entity, System } from "../core";
import Particle from "./Particle";
import ParticleEmitter from "./ParticleEmitter";
import { Transform } from "../math";

export default class ParticleSystem extends System<[Particle, Transform]> {
    public constructor() {
        super([Particle, Transform]);
    }

    public onAddedToEcsManager(ecsManager: EcsManager) {
        ecsManager.addSystem(new ParticleEmitterSystem());

        this.dependencies.push(ParticleEmitterSystem);
    }

    protected onLoop(
        components: [Particle, Transform][],
        entities: Entity[],
        deltaTime: number
    ): void {
        for (let i = components.length - 1; i >= 0; i--) {
            const [particle, transform] = components[i];

            particle.timeAlive += deltaTime;

            if (particle.timeAlive >= particle.lifeTime) {
                entities[i].destroy();
            } else {
                transform.translate(particle.direction);
                transform.setScale(
                    new Vec3(
                        particle.startScale +
                            (particle.endScale - particle.startScale) *
                                (particle.timeAlive / particle.lifeTime)
                    )
                );
            }
        }
    }
}

export class ParticleEmitterSystem extends System<[ParticleEmitter]> {
    public constructor() {
        super([ParticleEmitter]);
    }

    public onEntityEligible(
        entity: Entity,
        lastComponentAdded: Component | undefined
    ) {
        const particleEmitter = (entity.getComponent(ParticleEmitter) ??
            lastComponentAdded) as ParticleEmitter;

        for (let i = 0; i < particleEmitter.startParticleCount; i++) {
            const particle = particleEmitter.particlePrefab.clone();

            entity.addChild(particle);
        }
    }

    protected onLoop(
        components: [ParticleEmitter][],
        entities: Entity[],
        deltaTime: number
    ): void {
        for (let i = 0; i < components.length; i++) {
            const [particleEmitter] = components[i];

            const { children } = entities[i];

            if (children.length < particleEmitter.maxParticleCount) {
                const particle = particleEmitter.particlePrefab.clone();

                entities[i].addChild(particle);
            }
        }
    }
}
