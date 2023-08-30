import { System } from "../core";
import ThreeAnimation from "./ThreeAnimation";
import { Animation } from "../utils";
export default class ThreeAnimationSystem extends System {
    constructor(tps) {
        super([ThreeAnimation, Animation], tps);
    }
    onEntityEligible(entity, components) {
        const [threeAnimation, animation] = components;
        threeAnimation.playAnimation(animation.name);
    }
    onEntityNoLongerEligible(entity, components) {
        const [threeAnimation] = components;
    }
    async onStart() { }
    onLoop(components, entities, deltaTime) {
        for (let i = components.length - 1; i >= 0; i--) {
            const [threeAnimation, animation] = components[i];
            const threeAnimationDuration = threeAnimation.currentAnimation?.getClip().duration ?? 1;
            const speed = (threeAnimationDuration * 1000) / animation.duration;
            threeAnimation.mixer?.update((deltaTime * speed) / 1000);
        }
    }
}
