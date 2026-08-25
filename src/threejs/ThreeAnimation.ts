import { AnimationAction, AnimationClip, AnimationMixer } from "three";
import { Component, Entity } from "../core";
import ThreeObject3D from "./ThreeObject3D";

export default class ThreeAnimation extends Component {
    #mixer?: AnimationMixer;

    #clips?: AnimationClip[];

    #actions?: Map<string, AnimationAction[]>;

    #currentAnimations?: AnimationAction[];

    public constructor() {
        super();

        this.#actions = new Map();
    }

    public onAddedToEntity(entity: Entity) {
        const component = entity.getComponent(ThreeObject3D);
        if (!component) {
            return;
        }
        this.createMixer(component);
    }

    public onComponentAddedToAttachedEntity(component: Component) {
        if (component instanceof ThreeObject3D) {
            this.createMixer(component);
        }
    }

    private createMixer(meshComponent: ThreeObject3D) {
        const { object3D } = meshComponent;
        const firstChild = object3D.children[0];
        const animatedRoot =
            object3D.children.length === 1 &&
            firstChild &&
            "animations" in firstChild &&
            Array.isArray(firstChild.animations)
                ? firstChild
                : object3D;

        this.#mixer = new AnimationMixer(animatedRoot);
        this.#clips = animatedRoot.animations;
        this.#clips.forEach((clip) => {
            const action = this.#mixer?.clipAction(clip);
            if (action) {
                // Models with multiple armatures can expose several clips that
                // share the same name. Keep every action so all of them play.
                const actions = this.#actions!.get(clip.name) ?? [];
                actions.push(action);
                this.#actions!.set(clip.name, actions);
                action.weight = 0;
                action.play();
            } else {
                console.warn("No action found for clip ", clip);
            }
        });
    }

    public playAnimation(animationName?: string) {
        // TODO: Move this to the system
        if (!this.#clips || !animationName) {
            console.warn("No clips found or animation name not provided");
            return;
        }

        if (
            this.#currentAnimations &&
            this.#currentAnimations.length > 0 &&
            this.#currentAnimations.every(
                (action) => action.getClip().name === animationName
            )
        ) {
            return;
        }

        const actions = this.#actions?.get(animationName);

        if (!actions || actions.length === 0) {
            console.warn("No action found");
            return;
        }

        const previous = this.#currentAnimations ?? [];

        actions.forEach((action) => {
            action.reset();
            action.setEffectiveTimeScale(1);
            action.setEffectiveWeight(1);
            action.play();
        });

        previous.forEach((action) => action.fadeOut(0.2));

        this.#currentAnimations = actions;
    }

    public stopAnimation() {
        this.#currentAnimations?.forEach((action) => action.stop());
    }

    public get currentAnimation(): AnimationAction[] | undefined {
        return this.#currentAnimations;
    }

    public get mixer(): AnimationMixer | undefined {
        return this.#mixer;
    }

    public get clips(): AnimationClip[] | undefined {
        return this.#clips;
    }

    public clone(): Component {
        return new ThreeAnimation();
    }
}
