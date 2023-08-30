import { Component } from "../../core";
export default class ThreeLightComponent extends Component {
    #light;
    #target;
    constructor(light, target, castShadow) {
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
    get target() {
        return this.#target;
    }
    get light() {
        return this.#light;
    }
}
