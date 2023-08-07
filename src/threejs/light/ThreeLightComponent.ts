import { CameraHelper, Light } from "three";
import { Component, Entity } from "../../core";

export default class ThreeLightComponent extends Component {
    #light: Light;

    #target?: Entity;

    public constructor(light: Light, target?: Entity, castShadow?: boolean) {
        super();
        this.#light = light;
        this.#target = target;
        if (castShadow && this.#light.shadow) {
            this.#light.castShadow = true;
            this.#light.shadow.mapSize.width = 512;
            this.#light.shadow.mapSize.height = 512;

            if (!this.#light.shadow.camera) {
                throw new Error("Light does not have a shadow camera");
            }

            // @ts-ignore
            this.#light.shadow.camera.near = 0.5;
            // @ts-ignore
            this.#light.shadow.camera.far = 500;
        }
    }

    public get target(): Entity | undefined {
        return this.#target;
    }

    public get light(): Light {
        return this.#light;
    }
}
