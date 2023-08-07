import { Camera } from "three";
import { vec3 } from "gl-matrix";
import { Component, Entity } from "../../core";

export default class ThreeCameraComponent extends Component {
    #camera: Camera;

    #lookAt?: Entity;

    #lookAtOffset: vec3;

    readonly #orbitControls: boolean;

    public constructor(
        camera: Camera,
        lookAt?: Entity,
        lookAtOffset?: vec3,
        id?: string,
        update?: boolean
    ) {
        super(id);
        this.#camera = camera;
        this.#lookAt = lookAt;
        this.#lookAtOffset = lookAtOffset || vec3.create();
        this.#orbitControls = update ?? true;
    }

    public get orbitControls(): boolean {
        return this.#orbitControls;
    }

    public get lookAtOffset(): vec3 {
        return this.#lookAtOffset;
    }

    public set lookAtOffset(value: vec3) {
        this.#lookAtOffset = value;
    }

    public get lookAt(): Entity | undefined {
        return this.#lookAt;
    }

    public set lookAt(value: Entity | undefined) {
        this.#lookAt = value;
    }

    public get camera(): Camera {
        return this.#camera;
    }

    public set camera(value: Camera) {
        this.#camera = value;
    }
}
