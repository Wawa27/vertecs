import { Vec3Like } from "ts-gl-matrix";
import { Entity } from "../core";
export default class Ray {
    #private;
    constructor(origin: Vec3Like, direction: Vec3Like);
    getSphereIntersection(sphereEntity: Entity): Vec3Like | undefined;
    get origin(): Vec3Like;
    get direction(): Vec3Like;
}
