import { AnimationAction, AnimationClip, AnimationMixer } from "three";
import { Component, Entity } from "../core";
export default class ThreeAnimation extends Component {
    #private;
    constructor();
    onAddedToEntity(entity: Entity): void;
    onComponentAddedToAttachedEntity(component: Component): void;
    private createMixer;
    playAnimation(animationName?: string): void;
    stopAnimation(): void;
    get currentAnimation(): AnimationAction | undefined;
    get mixer(): AnimationMixer | undefined;
    get clips(): AnimationClip[] | undefined;
}
