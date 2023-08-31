import { Camera } from "three";
import { Vec3 } from "ts-gl-matrix";
import { Component, Entity } from "../../core";
export default class ThreeCamera extends Component {
    #private;
    constructor(camera: Camera, lookAt?: Entity, lookAtOffset?: Vec3, id?: string, update?: boolean);
    get orbitControls(): boolean;
    get lookAtOffset(): Vec3;
    set lookAtOffset(value: Vec3);
    get lookAt(): Entity | undefined;
    set lookAt(value: Entity | undefined);
    get camera(): Camera;
    set camera(value: Camera);
}
