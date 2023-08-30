import Body, { BodyOptions, PhysicsData } from "./Body";
import AxisAlignedBoundingBox from "../AxisAlignedBoundingBox";
type SphereBodyOptions = BodyOptions & {
    radius: number;
};
export default class SphereBody extends Body {
    #private;
    constructor(sphereBodyOptions: SphereBodyOptions);
    getBoundingBox(): AxisAlignedBoundingBox;
    get radius(): number;
    set radius(radius: number);
    read(data: PhysicsData): void;
    write(): PhysicsData;
    clone(): SphereBody;
}
export {};
