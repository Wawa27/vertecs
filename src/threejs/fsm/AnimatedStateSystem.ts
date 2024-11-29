import { Entity, System } from "../../core";
import ThreeAnimation from "../ThreeAnimation";
import AnimatedState from "./AnimatedState";
import { Animation } from "../../utils";

/**
 * System for handling animated states
 */
export default class AnimatedStateSystem extends System<[AnimatedState]> {
    public constructor() {
        super([AnimatedState], 60);
    }

    public onEntityEligible(entity: Entity, components: [AnimatedState]) {
        const meshEntity = entity.findWithComponent(ThreeAnimation);

        if (!meshEntity) {
            console.warn("Animation not found for ", entity);
            return;
        }

        const [animatedState] = components;

        if (animatedState.duration === 0) {
            const clip = meshEntity
                .getComponent(ThreeAnimation)
                ?.clips?.find((clip) => clip.name === animatedState.name);
            if (!clip) {
                console.warn(
                    "Clip duration not found for : ",
                    animatedState.name
                );
            }
            animatedState.duration = (clip?.duration ?? 0) * 1000;
        }

        meshEntity.removeComponent(Animation);
        meshEntity.addComponent(
            new Animation(
                animatedState.name,
                animatedState.duration,
                animatedState.repeat,
                animatedState.startTime
            )
        );
    }

    protected onLoop(
        components: [AnimatedState][],
        entities: Entity[],
        deltaTime: number
    ): void {}

    public onEntityNoLongerEligible(
        entity: Entity,
        components: [AnimatedState]
    ) {
        const meshEntity = entity?.root.findWithComponent(ThreeAnimation);
        if (!meshEntity) {
            return;
        }
        meshEntity.removeComponent(Animation);
    }
}
