import { Scene } from "three";
import { Component, Entity, System } from "../../core";
import ThreeLightComponent from "./ThreeLightComponent";
import { Transform } from "../../math";
import ThreeMesh from "../ThreeMesh";

export default class ThreeLightSystem extends System<
    [ThreeLightComponent, Transform]
> {
    #scene: Scene;

    public constructor(scene: Scene, tps?: number) {
        super([ThreeLightComponent, Transform], tps);
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

    protected onLoop(
        components: [ThreeLightComponent, Transform][],
        entities: Entity[],
        deltaTime: number
    ): void {
        for (let i = 0; i < components.length; i++) {
            const [lightComponent, transform] = components[i];

            const worldPosition = transform.getWorldPosition();
            lightComponent.light.position.set(
                worldPosition[0],
                worldPosition[1],
                worldPosition[2]
            );
        }
    }
}
