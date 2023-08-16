import { Component, Entity, System } from "../core";
import ThreeAnimation from "./ThreeAnimation";

export default class ThreeAnimationSystem extends System<[ThreeAnimation]> {
    public constructor(tps?: number) {
        super([ThreeAnimation], tps);
    }

    public onEntityEligible(
        entity: Entity,
        lastComponentAdded: Component | undefined
    ) {}

    public async onStart(): Promise<void> {}

    protected onLoop(
        components: [ThreeAnimation][],
        entities: Entity[],
        deltaTime: number
    ): void {
        for (let i = 0; i < entities.length; i++) {
            const [animationComponent] = components[i];
            animationComponent.mixer?.update(deltaTime / 1000);
        }
    }
}
