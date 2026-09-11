import { Entity, System } from "../core";
import ThreeAnimationComponent from "./three-animation.component";
import { Animation } from "../utils";

export default class ThreeAnimationSystem extends System<
    [ThreeAnimationComponent, Animation]
> {
    public constructor(tps?: number) {
        super([ThreeAnimationComponent, Animation], tps);
    }

    public onEntityEligible(
        entity: Entity,
        components: [ThreeAnimationComponent, Animation]
    ) {
        const [threeAnimation, animation] = components;
        threeAnimation.playAnimation(animation.name);
    }

    public onEntityNoLongerEligible(
        entity: Entity,
        components: [ThreeAnimationComponent, Animation]
    ) {
        const [threeAnimation] = components;
    }

    public async onStart(): Promise<void> {}

    protected onLoop(
        components: [ThreeAnimationComponent, Animation][],
        entities: Entity[],
        deltaTime: number
    ): void {
        for (let i = components.length - 1; i >= 0; i--) {
            const [threeAnimation, animation] = components[i];

            threeAnimation.mixer?.update(deltaTime / 1000);
        }
    }
}
