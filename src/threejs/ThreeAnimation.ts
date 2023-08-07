import { AnimationAction, AnimationClip, AnimationMixer } from "three";
import { Component, Entity } from "../core";
import ThreeMesh from "./ThreeMesh";

export default class ThreeAnimation extends Component {
    #mixer?: AnimationMixer;

    #clips?: AnimationClip[];

    #actions?: Map<string, AnimationAction>;

    #currentAnimation?: AnimationAction;

    public constructor() {
        super();

        this.#actions = new Map();
    }

    public onAddedToEntity(entity: Entity) {
        const component = entity.getComponent(ThreeMesh);
        if (!component) {
            return;
        }
        this.createMixer(component);
    }

    public onComponentAddedToAttachedEntity(component: Component) {
        if (component instanceof ThreeMesh) {
            this.createMixer(component);
        }
    }

    private createMixer(meshComponent: ThreeMesh) {
        this.#mixer = new AnimationMixer(meshComponent.object3d);
        this.#clips = meshComponent.object3d.animations;
        this.#clips.forEach((clip) => {
            const action = this.#mixer?.clipAction(clip);
            if (action) {
                this.#actions?.set(clip.name, action);
                action.weight = 0;
                action.play();
            }
        });
    }

    public playAnimation(animationName?: string) {
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

        // Fade out current animation
        if (action) {
            action.enabled = true;
            action.setEffectiveTimeScale(1);
            action.setEffectiveWeight(1);

            if (this.#currentAnimation) {
                this.#currentAnimation.time = 0;
                this.#currentAnimation.weight = 1;
                this.#currentAnimation.crossFadeTo(action, 0.2, false);
            }
        }

        this.#currentAnimation = action;
    }

    public stopAnimation() {
        this.#currentAnimation?.stop();
    }

    public get currentAnimation(): AnimationAction | undefined {
        return this.#currentAnimation;
    }

    public get mixer(): AnimationMixer | undefined {
        return this.#mixer;
    }

    public get clips(): AnimationClip[] | undefined {
        return this.#clips;
    }
}
