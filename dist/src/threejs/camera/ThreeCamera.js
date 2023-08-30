import { Vec3 } from "ts-gl-matrix";
import { Component } from "../../core";
export default class ThreeCamera extends Component {
    #camera;
    #lookAt;
    #lookAtOffset;
    #orbitControls;
    constructor(camera, lookAt, lookAtOffset, id, update) {
        super(id);
        this.#camera = camera;
        this.#lookAt = lookAt;
        this.#lookAtOffset = lookAtOffset || new Vec3();
        this.#orbitControls = update ?? true;
    }
    get orbitControls() {
        return this.#orbitControls;
    }
    get lookAtOffset() {
        return this.#lookAtOffset;
    }
    set lookAtOffset(value) {
        this.#lookAtOffset = value;
    }
    get lookAt() {
        return this.#lookAt;
    }
    set lookAt(value) {
        this.#lookAt = value;
    }
    get camera() {
        return this.#camera;
    }
    set camera(value) {
        this.#camera = value;
    }
}
