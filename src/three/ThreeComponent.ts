import { Component } from "src/core";
import { BoxGeometry, Mesh, MeshBasicMaterial, Object3D } from "three";

export default class ThreeComponent extends Component {
    #isVisible: boolean;

    #object3d: Object3D;

    public constructor(id?: string) {
        super(id);

        this.#isVisible = true;
        this.#object3d = new Mesh(new BoxGeometry(), new MeshBasicMaterial());
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
}
