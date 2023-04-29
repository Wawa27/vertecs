import { Camera } from "three";
import { Component } from "../core";

export default class ThreeCameraComponent extends Component {
    #camera: Camera;

    public constructor(id: string, camera: Camera) {
        super(id);
        this.#camera = camera;
    }

    public get camera(): Camera {
        return this.#camera;
    }

    public set camera(value: Camera) {
        this.#camera = value;
    }
}
