import { Vec3 } from "ts-gl-matrix";
import { Entity, System } from "../core";
import { Transform } from "../math";
import ParticleAttractorComponent from "./particle-attractor.component";
import ParticleComponent from "./particle.component";

export default class ParticleAttractorSystem extends System<
    [ParticleAttractorComponent, Transform]
> {
    #strength = 0.5;

    public constructor() {
        super([ParticleAttractorComponent, Transform]);
    }

    protected onLoop(
        components: [ParticleAttractorComponent, Transform][],
        entities: Entity[],
        deltaTime: number
    ): void {
        for (let i = 0; i < entities.length; i++) {
            const entity = entities[i];
            const attractorTransform = components[i][1];
            const rootEntity = entity.root;

            const particles =
                rootEntity.findAllWithComponent(ParticleComponent);

            particles.forEach((particle) => {
                const particleTransform = particle.getComponent(Transform);

                if (!particleTransform) {
                    console.warn("Transform not found for particle", entity);
                    return;
                }

                const worldDistanceFromParticle =
                    attractorTransform.getWorldDistanceFrom(particleTransform);
                const worldOffset = Vec3.sub(
                    new Vec3(),
                    attractorTransform.getWorldPosition(),
                    particleTransform.getWorldPosition()
                );

                const force = this.#strength / (1 + worldDistanceFromParticle);

                const velocity = Vec3.scale(
                    worldOffset,
                    worldOffset,
                    (force * deltaTime) / 1_000
                );

                particleTransform.translate(velocity);
            });
        }
    }
}
