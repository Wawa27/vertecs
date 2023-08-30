import { Camera } from "three";
import { Vec3 } from "ts-gl-matrix";
import { Component, Entity } from "../../core";

export default class ThreeCamera extends Component {
    #camera: Camera;

    #lookAt?: Entity;

    #lookAtOffset: Vec3;

    readonly #orbitControls: boolean;

    public constructor(
        camera: Camera,
        lookAt?: Entity,
        lookAtOffset?: Vec3,
        id?: string,
        update?: boolean
    ) {
        super(id);
        this.#camera = camera;
        this.#lookAt = lookAt;
        this.#lookAtOffset = lookAtOffset || new Vec3();
        this.#orbitControls = update ?? true;
    }

    public get orbitControls(): boolean {
        return this.#orbitControls;
    }

    public get lookAtOffset(): Vec3 {
        return this.#lookAtOffset;
    }

    public set lookAtOffset(value: Vec3) {
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
