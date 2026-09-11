import { Entity, System } from "../core";
import { Transform } from "../math";
import ParticleAttractorComponent from "./particle-attractor.component";

export default class ParticleAttractorSystem extends System<
    [ParticleAttractorComponent, Transform]
> {
    public constructor() {
        super([ParticleAttractorComponent, Transform]);
    }

    protected onLoop(
        components: [ParticleAttractorComponent, Transform][],
        entities: Entity[],
        deltaTime: number
    ): void {
        entities.forEach((entity) => {
            const rootEntity = entity.root;

            const particles = null;
        });
    }
}
