import { Component, Entity, System } from "../core";
import ThreeAnimation from "./ThreeAnimation";

export default class ThreeAnimationSystem extends System {
    public constructor(tps?: number) {
        super([ThreeAnimation], tps);
    }

    public onEntityEligible(
        entity: Entity,
        lastComponentAdded: Component | undefined
    ) {}

    public async onStart(): Promise<void> {}

    protected onLoop(entities: Entity[], deltaTime: number): void {
        entities.forEach((entity) => {
            const animationComponent = entity.getComponent(ThreeAnimation);
            animationComponent?.mixer?.update(deltaTime / 1000);
        });
    }
}
