import { AnimationMixer } from "three";
import { Component } from "../core";
import ThreeObject3D from "./ThreeObject3D";
export default class ThreeAnimation extends Component {
    #mixer;
    #clips;
    #actions;
    #currentAnimation;
    constructor() {
        super();
        this.#actions = new Map();
    }
    onAddedToEntity(entity) {
        const component = entity.getComponent(ThreeObject3D);
        if (!component) {
            return;
        }
        this.createMixer(component);
    }
    onComponentAddedToAttachedEntity(component) {
        if (component instanceof ThreeObject3D) {
            this.createMixer(component);
        }
    }
    createMixer(meshComponent) {
        this.#mixer = new AnimationMixer(meshComponent.object3D);
        this.#clips = meshComponent.object3D.animations;
        this.#clips.forEach((clip) => {
            const action = this.#mixer?.clipAction(clip);
            if (action) {
                this.#actions?.set(clip.name, action);
                action.weight = 0;
                action.play();
            }
        });
    }
    playAnimation(animationName) {
        // TODO: Move this to the system
        if (!this.#clips || !animationName) {
            console.warn("No clips found or animation name not provided");
            return;
        }
        if (this.#currentAnimation?.getClip().name === animationName) {
            return;
        }
        const action = this.#actions?.get(animationName);
        if (!action) {
            console.warn("No action found");
            return;
        }
        action.enabled = true;
        action.setEffectiveTimeScale(1);
        action.setEffectiveWeight(1);
        if (this.#currentAnimation) {
            this.#currentAnimation.time = 0;
            this.#currentAnimation.weight = 1;
            this.#currentAnimation.crossFadeTo(action, 0.2, false);
        }
        this.#currentAnimation = action;
    }
    stopAnimation() {
        this.#currentAnimation?.stop();
    }
    get currentAnimation() {
        return this.#currentAnimation;
    }
    get mixer() {
        return this.#mixer;
    }
    get clips() {
        return this.#clips;
    }
}
