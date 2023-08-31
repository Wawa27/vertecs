import { Entity, System } from "../core";
import ThreeAnimation from "./ThreeAnimation";
import { Animation } from "../utils";
export default class ThreeAnimationSystem extends System<[
    ThreeAnimation,
    Animation
]> {
    constructor(tps?: number);
    onEntityEligible(entity: Entity, components: [ThreeAnimation, Animation]): void;
    onEntityNoLongerEligible(entity: Entity, components: [ThreeAnimation, Animation]): void;
    onStart(): Promise<void>;
    protected onLoop(components: [ThreeAnimation, Animation][], entities: Entity[], deltaTime: number): void;
}
