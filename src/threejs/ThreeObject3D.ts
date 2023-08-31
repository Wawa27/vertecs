import { Material, Mesh, Object3D } from "three";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";
import { Component } from "../core";

export default class ThreeObject3D extends Component {
    #isVisible: boolean;

    #object3D: Object3D;

    public constructor(object3D: Object3D, id?: string) {
        super(id);

        this.#isVisible = true;
        this.#object3D = object3D;
    }

    public get object3D(): Object3D {
        return this.#object3D;
    }

    public set object3D(value: Object3D) {
        this.#object3D = value;
    }

    public get isVisible(): boolean {
        return this.#isVisible;
    }

    public set isVisible(value: boolean) {
        this.#isVisible = value;
    }

    public clone(): ThreeObject3D {
        const mesh = this.object3D as Mesh;
        const clonedMesh = SkeletonUtils.clone(mesh) as Mesh;
        const { material } = mesh;

        if (material instanceof Material) {
            clonedMesh.material = material.clone();
        } else if (Array.isArray(material)) {
            const materials = material as Material[];
            clonedMesh.material = materials.map((material) => material.clone());
        }

        return new ThreeObject3D(clonedMesh);
    }
}
