import { vec3 } from "gl-matrix";
import SphereBody from "../bodies/SphereBody";

export default interface Narrowphase {
    getSphereSphereCollision(
        sphere1Position: vec3,
        sphere1Shape: SphereBody,
        sphere2Position: vec3,
        sphere2Shape: SphereBody
    ): vec3 | undefined;
}
