// @ts-ignore
import { World } from "oimo-esm";
import { quat, vec3 } from "ts-gl-matrix";
import { MathUtils, Transform } from "../math";
import { System } from "../core";
import OimoComponent from "./OimoComponent";
export default class OimoSystem extends System {
    #world;
    constructor(tps) {
        super([OimoComponent, Transform], tps);
    }
    async onStart() {
        this.#world = new World({
            timestep: 1 / 60,
            iterations: 8,
            broadphase: 2,
            worldscale: 1,
            random: true,
            info: true,
        });
    }
    onEntityEligible(entity, components) {
        const [oimoComponent, transform] = components;
        const worldPosition = transform?.position ?? [0, 0, 0];
        const worldRotation = MathUtils.getEulerFromQuat(vec3.create(), transform?.getWorldRotation() ?? quat.create());
        oimoComponent.body = this.#world?.add({
            ...oimoComponent.bodyOptions,
            pos: [worldPosition[0], worldPosition[1], worldPosition[2]],
            rot: [worldRotation[0], worldRotation[1], worldRotation[2]],
        });
    }
    onLoop(components, entities, deltaTime) {
        this.#world?.step();
        for (let i = 0; i < components.length; i++) {
            const [oimoComponent, transform] = components[i];
            if (!oimoComponent.body) {
                throw new Error("Oimo body not found");
            }
            transform.setPosition([
                oimoComponent.body.position.x,
                oimoComponent.body.position.y,
                oimoComponent.body.position.z,
            ]);
            // TODO: Allow manual rotation
            if (oimoComponent.bodyOptions.disableRotation) {
                oimoComponent.body.angularVelocity.set(0, 0, 0);
                const worldRotation = transform.getWorldRotation();
                oimoComponent.body.quaternion.set(worldRotation[0], worldRotation[1], worldRotation[2], worldRotation[3]);
            }
            else {
                transform.setRotationQuat(quat.fromValues(oimoComponent.body.getQuaternion().x, oimoComponent.body.getQuaternion().y, oimoComponent.body.getQuaternion().z, oimoComponent.body.getQuaternion().w));
            }
        }
    }
}
