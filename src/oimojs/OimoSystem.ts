// @ts-ignore
import { World } from "oimo-esm";
import { quat, vec3 } from "gl-matrix";
import { MathUtils, Transform } from "../math";
import { Component, Entity, System } from "../core";
import OimoComponent from "./OimoComponent";

export default class OimoSystem extends System {
    #world?: World;

    public constructor(tps?: number) {
        super([OimoComponent, Transform], tps);
    }

    public async onStart(): Promise<void> {
        this.#world = new World({
            timestep: 1 / 60,
            iterations: 8,
            broadphase: 2,
            worldscale: 1,
            random: true,
            info: true,
        });
    }

    public onEntityEligible(
        entity: Entity,
        lastComponentAdded: Component | undefined
    ) {
        const oimoComponent = entity.getComponent(OimoComponent);
        const transform = entity.getComponent(Transform);

        if (!oimoComponent || !transform) {
            throw new Error("OimoComponent or Transform not found");
        }

        const worldPosition = transform?.position ?? [0, 0, 0];

        const worldRotation = MathUtils.getEulerFromQuat(
            vec3.create(),
            transform?.getWorldRotation(quat.create()) ?? quat.create()
        );

        oimoComponent.body = this.#world?.add({
            ...oimoComponent.bodyOptions,
            pos: [worldPosition[0], worldPosition[1], worldPosition[2]],
            rot: [worldRotation[0], worldRotation[1], worldRotation[2]],
        });
    }

    protected onLoop(entities: Entity[], deltaTime: number): void {
        this.#world?.step();

        for (let i = 0; i < entities.length; i++) {
            const entity = entities[i];
            const oimoComponent = entity.getComponent(OimoComponent);
            const transform = entity.getComponent(Transform);

            if (!oimoComponent || !transform || !oimoComponent.body) {
                throw new Error("OimoComponent or Transform not found");
            }

            transform?.setPosition([
                oimoComponent.body.position.x,
                oimoComponent.body.position.y,
                oimoComponent.body.position.z,
            ]);

            // TODO: Allow manual rotation
            if (oimoComponent.bodyOptions.disableRotation) {
                oimoComponent.body.angularVelocity.set(0, 0, 0);
                const worldRotation = transform.getWorldRotation(quat.create());
                oimoComponent.body.quaternion.set(
                    worldRotation[0],
                    worldRotation[1],
                    worldRotation[2],
                    worldRotation[3]
                );
            } else {
                transform?.setRotationQuat(
                    quat.fromValues(
                        oimoComponent.body.getQuaternion().x,
                        oimoComponent.body.getQuaternion().y,
                        oimoComponent.body.getQuaternion().z,
                        oimoComponent.body.getQuaternion().w
                    )
                );
            }
        }
    }
}
