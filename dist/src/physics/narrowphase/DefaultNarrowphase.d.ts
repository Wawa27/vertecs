import { Vec3 } from "ts-gl-matrix";
import SphereBody from "../bodies/SphereBody";
import Narrowphase from "./Narrowphase";
export default class DefaultNarrowphase implements Narrowphase {
    constructor();
    getSphereSphereCollision(sphere1Position: Vec3, sphere1Shape: SphereBody, sphere2Position: Vec3, sphere2Shape: SphereBody): Vec3 | undefined;
}
