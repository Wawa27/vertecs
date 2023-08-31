import { Vec3Like } from "ts-gl-matrix";
export default class AxisAlignedBoundingBox {
    #private;
    constructor(min: Vec3Like, max: Vec3Like);
    contains(point: Vec3Like): boolean;
    intersects(other: AxisAlignedBoundingBox): boolean;
    get minimum(): Vec3Like;
    get maximum(): Vec3Like;
}
