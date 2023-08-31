import { Vec3 } from "ts-gl-matrix";
import SphereBody from "../bodies/SphereBody";
export default interface Narrowphase {
    getSphereSphereCollision(sphere1Position: Vec3, sphere1Shape: SphereBody, sphere2Position: Vec3, sphere2Shape: SphereBody): Vec3 | undefined;
}
