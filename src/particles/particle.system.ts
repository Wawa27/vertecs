import { Vec3 } from "ts-gl-matrix";
import { Color, Material, MathUtils, Mesh } from "three";
import { EcsManager, Entity, System } from "../core";
import ParticleComponent from "./particle.component";
import ParticleEmitterComponent from "./particle-emitter.component";
import { Transform } from "../math";
import { ThreeObject3DComponent } from "../threejs";

export default class ParticleSystem extends System<
    [ParticleComponent, Transform, ThreeObject3DComponent]
> {
    public constructor() {
        super([ParticleComponent, Transform, ThreeObject3DComponent]);
    }

    public onAddedToEcsManager(ecsManager: EcsManager) {
        ecsManager.addSystem(new ParticleEmitterSystem());

        this.dependencies.push(ParticleEmitterSystem);
    }

    protected onLoop(
        components: [ParticleComponent, Transform, ThreeObject3DComponent][],
        entities: Entity[],
        deltaTime: number
    ): void {
        for (let i = components.length - 1; i >= 0; i--) {
            const [particle, transform, threeMesh] = components[i];

            particle.timeAlive += deltaTime;

            if (particle.timeAlive >= particle.lifeTime) {
                entities[i].destroy();
            } else {
                transform.setWorldScale(
                    new Vec3(
                        particle.startScale +
                            (particle.endScale - particle.startScale) *
                                (particle.timeAlive / particle.lifeTime)
                    )
                );
                const worldPosition = new Vec3(transform.getWorldPosition());
                worldPosition.add([
                    particle.direction[0],
                    particle.direction[1],
                    particle.direction[2],
                ]);
                transform.setWorldPosition(worldPosition);
                const material = (threeMesh.object3D as Mesh)
                    .material as Material;
                // @ts-ignore
                const color = material.color as Color;

                const particleLifetimeRatio =
                    particle.timeAlive / particle.lifeTime;

                const segmentCount = particle.colors.length - 1;
                const segmentRatio = 1 / segmentCount;

                const current = Math.min(
                    Math.floor(particleLifetimeRatio / segmentRatio),
                    segmentCount - 1
                );

                const from = particle.colors[current];
                const to = particle.colors[current + 1];

                const localT =
                    (particleLifetimeRatio - current * segmentRatio) /
                    segmentRatio;

                color.setRGB(
                    MathUtils.lerp(from.x, to.x, localT),
                    MathUtils.lerp(from.y, to.y, localT),
                    MathUtils.lerp(from.z, to.z, localT)
                );
            }
        }
    }
}

export class ParticleEmitterSystem extends System<[ParticleEmitterComponent]> {
    public constructor() {
        super([ParticleEmitterComponent]);
    }

    public onEntityEligible(
        entity: Entity,
        components: [ParticleEmitterComponent]
    ) {
        const [particleEmitter] = components;

        for (let i = 0; i < particleEmitter.startParticleCount; i++) {
            const particle = particleEmitter.particlePrefab.clone();

            entity.addChild(particle);
        }
    }

    protected onLoop(
        components: [ParticleEmitterComponent][],
        entities: Entity[],
        deltaTime: number
    ): void {
        for (let i = 0; i < components.length; i++) {
            const [particleEmitter] = components[i];
            particleEmitter.emittedParticleCount -=
                (deltaTime / 1000) * particleEmitter.emissionSpeed;

            const { children } = entities[i];

            for (let j = children.length - 1; j >= 0; j--) {
                const particle = children[j];

                const particleComponent =
                    particle.getComponent(ParticleComponent);
                if (particleComponent) {
                    particleComponent.timeAlive += deltaTime;

                    if (
                        particleComponent.timeAlive >=
                        particleComponent.lifeTime
                    ) {
                        particle.destroy();
                    }
                }
            }

            if (children.length < particleEmitter.maxParticleCount) {
                if (
                    particleEmitter.emittedParticleCount <
                    particleEmitter.emissionSpeed
                ) {
                    const particle = particleEmitter.particlePrefab.clone();

                    const particleTransform = particle.getComponent(Transform);
                    if (!particleTransform) {
                        console.warn(
                            "Transform particle not found on particle ",
                            particle
                        );
                        return;
                    }

                    particleTransform.translate(
                        new Vec3(
                            Math.random() * particleEmitter.emissionRadius -
                                particleEmitter.emissionRadius / 2,
                            0,
                            Math.random() * particleEmitter.emissionRadius -
                                particleEmitter.emissionRadius / 2
                        )
                    );

                    entities[i].addChild(particle);
                    particleEmitter.emittedParticleCount++;
                }
            }
        }
    }
}
