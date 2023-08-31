import { System } from "../../core";
import ThreeLightComponent from "./ThreeLightComponent";
import { Transform } from "../../math";
import ThreeObject3D from "../ThreeObject3D";
export default class ThreeLightSystem extends System {
    #scene;
    constructor(scene, tps) {
        super([ThreeLightComponent, Transform], tps);
        this.#scene = scene;
    }
    onEntityEligible(entity, components) {
        const lightComponent = entity.getComponent(ThreeLightComponent);
        if (!lightComponent) {
            throw new Error("Entity is missing a ThreeLightComponent");
        }
        this.#scene.add(lightComponent.light);
        if (lightComponent.target) {
            // @ts-ignore
            lightComponent.light.target =
                lightComponent.target.getComponent(ThreeObject3D)?.object3D;
        }
    }
    onEntityNoLongerEligible(entity, components) {
        const [threeLightComponent] = components;
        if (!threeLightComponent) {
            throw new Error("Entity is missing a ThreeLightComponent");
        }
        this.#scene.remove(threeLightComponent.light);
    }
    onLoop(components, entities, deltaTime) {
        for (let i = 0; i < components.length; i++) {
            const [lightComponent, transform] = components[i];
            const worldPosition = transform.getWorldPosition();
            lightComponent.light.position.set(worldPosition[0], worldPosition[1], worldPosition[2]);
        }
    }
}
