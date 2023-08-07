import { Object3D } from "three";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";
import { Component } from "../core";

export default class ThreeMesh extends Component {
    #isVisible: boolean;

    #object3d: Object3D;

    public constructor(object3D: Object3D, id?: string) {
        super(id);

        this.#isVisible = true;
        this.#object3d = object3D;
    }

    public get object3d(): Object3D {
        return this.#object3d;
    }

    public set object3d(value: Object3D) {
        this.#object3d = value;
    }

    public get isVisible(): boolean {
        return this.#isVisible;
    }

    public set isVisible(value: boolean) {
        this.#isVisible = value;
    }

    public clone(): ThreeMesh {
        return new ThreeMesh(SkeletonUtils.clone(this.#object3d));
    }
}
