import { Scene } from "three";
import { Entity, System } from "../../core";
import ThreeLightComponent from "./ThreeLightComponent";
import { Transform } from "../../math";
import ThreeObject3D from "../ThreeObject3D";
import { SystemConstructor } from "../../core/EcsManager";

export default class ThreeLightSystem extends System<
    [ThreeLightComponent, Transform]
> {
    #scene: Scene;

    public constructor(
        scene: Scene,
        tps?: number,
        dependencies?: SystemConstructor<any>[]
    ) {
        super([ThreeLightComponent, Transform], tps, dependencies);
        this.#scene = scene;
    }

    public onEntityEligible(
        entity: Entity,
        components: [ThreeLightComponent, Transform]
    ) {
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

    public onEntityNoLongerEligible(
        entity: Entity,
        components: [ThreeLightComponent, Transform]
    ) {
        const [threeLightComponent] = components;

        if (!threeLightComponent) {
            throw new Error("Entity is missing a ThreeLightComponent");
        }

        this.#scene.remove(threeLightComponent.light);
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
