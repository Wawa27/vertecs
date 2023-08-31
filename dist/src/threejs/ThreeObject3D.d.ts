import { Object3D } from "three";
import { Component } from "../core";
export default class ThreeObject3D extends Component {
    #private;
    constructor(object3D: Object3D, id?: string);
    get object3D(): Object3D;
    set object3D(value: Object3D);
    get isVisible(): boolean;
    set isVisible(value: boolean);
    clone(): ThreeObject3D;
}
