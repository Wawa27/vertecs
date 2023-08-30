import { Entity, System } from "../core";
import ThreeAnimation from "./ThreeAnimation";
import { Animation } from "../utils";

export default class ThreeAnimationSystem extends System<
    [ThreeAnimation, Animation]
> {
    public constructor(tps?: number) {
        super([ThreeAnimation, Animation], tps);
    }

    public onEntityEligible(
        entity: Entity,
        components: [ThreeAnimation, Animation]
    ) {
        const [threeAnimation, animation] = components;
        threeAnimation.playAnimation(animation.name);
    }

    public onEntityNoLongerEligible(
        entity: Entity,
        components: [ThreeAnimation, Animation]
    ) {
        const [threeAnimation] = components;
    }

    public async onStart(): Promise<void> {}

    protected onLoop(
        components: [ThreeAnimation, Animation][],
        entities: Entity[],
        deltaTime: number
    ): void {
        for (let i = components.length - 1; i >= 0; i--) {
            const [threeAnimation, animation] = components[i];

            const threeAnimationDuration =
                threeAnimation.currentAnimation?.getClip().duration ?? 1;

            const speed = (threeAnimationDuration * 1000) / animation.duration;

            threeAnimation.mixer?.update((deltaTime * speed) / 1000);
        }
    }
}
