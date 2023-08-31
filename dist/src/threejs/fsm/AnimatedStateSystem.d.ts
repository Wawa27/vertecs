import { Entity, System } from "../../core";
import AnimatedState from "./AnimatedState";
/**
 * System for handling animated states
 */
export default class AnimatedStateSystem extends System<[AnimatedState]> {
    constructor();
    onEntityEligible(entity: Entity, components: [AnimatedState]): void;
    protected onLoop(components: [AnimatedState][], entities: Entity[], deltaTime: number): void;
    onEntityNoLongerEligible(entity: Entity, components: [AnimatedState]): void;
}
