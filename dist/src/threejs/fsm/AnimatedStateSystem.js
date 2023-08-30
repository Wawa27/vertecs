import { System } from "../../core";
import { ThreeAnimation } from "../index";
import AnimatedState from "./AnimatedState";
import { Animation } from "../../utils";
/**
 * System for handling animated states
 */
export default class AnimatedStateSystem extends System {
    constructor() {
        super([AnimatedState], 60);
    }
    onEntityEligible(entity, components) {
        const meshEntity = entity?.root.findWithComponent(ThreeAnimation);
        if (!meshEntity) {
            return;
        }
        const [animatedState] = components;
        meshEntity.removeComponent(Animation);
        meshEntity.addComponent(new Animation(animatedState.name, animatedState.duration, animatedState.repeat, animatedState.startTime));
    }
    onLoop(components, entities, deltaTime) { }
    onEntityNoLongerEligible(entity, components) {
        const meshEntity = entity?.root.findWithComponent(ThreeAnimation);
        if (!meshEntity) {
            return;
        }
        meshEntity.removeComponent(Animation);
    }
}
