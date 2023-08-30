import { Material } from "three";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";
import { Component } from "../core";
export default class ThreeObject3D extends Component {
    #isVisible;
    #object3D;
    constructor(object3D, id) {
        super(id);
        this.#isVisible = true;
        this.#object3D = object3D;
    }
    get object3D() {
        return this.#object3D;
    }
    set object3D(value) {
        this.#object3D = value;
    }
    get isVisible() {
        return this.#isVisible;
    }
    set isVisible(value) {
        this.#isVisible = value;
    }
    clone() {
        const mesh = this.object3D;
        const clonedMesh = SkeletonUtils.clone(mesh);
        const { material } = mesh;
        if (material instanceof Material) {
            clonedMesh.material = material.clone();
        }
        else if (Array.isArray(material)) {
            const materials = material;
            clonedMesh.material = materials.map((material) => material.clone());
        }
        return new ThreeObject3D(clonedMesh);
    }
}
