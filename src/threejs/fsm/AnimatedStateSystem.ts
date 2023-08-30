import { Entity, System } from "../../core";
import { ThreeAnimation } from "../index";
import AnimatedState from "./AnimatedState";
import TimedStateSystem from "../../utils/fsm/TimedStateSystem";
import { Animation } from "../../utils";

/**
 * System for handling animated states
 */
export default class AnimatedStateSystem extends System<[AnimatedState]> {
    public constructor() {
        super([AnimatedState], 60);
    }

    public onEntityEligible(entity: Entity, components: [AnimatedState]) {
        const meshEntity = entity?.root.findWithComponent(ThreeAnimation);
        if (!meshEntity) {
            return;
        }

        const [animatedState] = components;

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
