import { Vec3 } from "ts-gl-matrix";
import { System } from "../core";
import Particle from "./Particle";
import ParticleEmitter from "./ParticleEmitter";
import { Transform } from "../math";
import { ThreeObject3D } from "../threejs";
export default class ParticleSystem extends System {
    constructor() {
        super([Particle, Transform, ThreeObject3D]);
    }
    onAddedToEcsManager(ecsManager) {
        ecsManager.addSystem(new ParticleEmitterSystem());
        this.dependencies.push(ParticleEmitterSystem);
    }
    onLoop(components, entities, deltaTime) {
        for (let i = components.length - 1; i >= 0; i--) {
            const [particle, transform, threeMesh] = components[i];
            particle.timeAlive += deltaTime;
            if (particle.timeAlive >= particle.lifeTime) {
                entities[i].destroy();
            }
            else {
                transform.setWorldScale(new Vec3(particle.startScale +
                    (particle.endScale - particle.startScale) *
                        (particle.timeAlive / particle.lifeTime)));
                const worldPosition = new Vec3(transform.getWorldPosition());
                worldPosition.add([
                    particle.direction[0],
                    particle.direction[1],
                    particle.direction[2],
                ]);
                transform.setWorldPosition(worldPosition);
                const material = threeMesh.object3D
                    .material;
                // @ts-ignore
                const color = material.color;
                color.setRGB((particle.startColor[0] +
                    (particle.endColor[0] - particle.startColor[0]) *
                        (particle.timeAlive / particle.lifeTime)) /
                    255, (particle.startColor[1] +
                    (particle.endColor[1] - particle.startColor[1]) *
                        (particle.timeAlive / particle.lifeTime)) /
                    255, (particle.startColor[2] +
                    (particle.endColor[2] - particle.startColor[2]) *
                        (particle.timeAlive / particle.lifeTime)) /
                    255);
                material.opacity =
                    0.3 + 1 - particle.timeAlive / particle.lifeTime;
            }
        }
    }
}
export class ParticleEmitterSystem extends System {
    constructor() {
        super([ParticleEmitter]);
    }
    onEntityEligible(entity, components) {
        const [particleEmitter] = components;
        for (let i = 0; i < particleEmitter.startParticleCount; i++) {
            const particle = particleEmitter.particlePrefab.clone();
            entity.addChild(particle);
        }
    }
    onLoop(components, entities, deltaTime) {
        for (let i = 0; i < components.length; i++) {
            const [particleEmitter] = components[i];
            const { children } = entities[i];
            for (let j = children.length - 1; j >= 0; j--) {
                const particle = children[j];
                const particleComponent = particle.getComponent(Particle);
                if (particleComponent) {
                    particleComponent.timeAlive += deltaTime;
                    if (particleComponent.timeAlive >=
                        particleComponent.lifeTime) {
                        particle.destroy();
                    }
                }
            }
            if (children.length < particleEmitter.maxParticleCount) {
                const particle = particleEmitter.particlePrefab.clone();
                entities[i].addChild(particle);
            }
        }
    }
}
