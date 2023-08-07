import { Scene } from "three";
import { vec3 } from "gl-matrix";
import { Component, Entity, System } from "../../core";
import ThreeLightComponent from "./ThreeLightComponent";
import { Transform } from "../../math";
import ThreeMesh from "../ThreeMesh";

export default class ThreeLightSystem extends System {
    #scene: Scene;

    public constructor(scene: Scene, tps?: number) {
        super([ThreeLightComponent], tps);
        this.#scene = scene;
    }

    public onEntityEligible(
        entity: Entity,
        lastComponentAdded: Component | undefined
    ) {
        const lightComponent = entity.getComponent(ThreeLightComponent);

        if (!lightComponent) {
            throw new Error("Entity is missing a ThreeLightComponent");
        }

        this.#scene.add(lightComponent.light);

        if (lightComponent.target) {
            // @ts-ignore
            lightComponent.light.target =
                lightComponent.target.getComponent(ThreeMesh)?.object3d;
        }
    }

    protected onLoop(entities: Entity[], deltaTime: number): void {
        entities.forEach((entity) => {
            const lightComponent = entity.getComponent(ThreeLightComponent);
            const transform = entity.getComponent(Transform);

            if (!lightComponent) {
                throw new Error("Entity is missing a ThreeLightComponent");
            }

            if (transform) {
                const worldPosition = transform.getWorldPosition(vec3.create());
                lightComponent.light.position.set(
                    worldPosition[0],
                    worldPosition[1],
                    worldPosition[2]
                );
            }
        });
    }
}
