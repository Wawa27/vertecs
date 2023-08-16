import { Vec3, vec3 } from "ts-gl-matrix";
import SphereBody from "../bodies/SphereBody";
import Narrowphase from "./Narrowphase";

export default class DefaultNarrowphase implements Narrowphase {
    public constructor() {}

    public getSphereSphereCollision(
        sphere1Position: Vec3,
        sphere1Shape: SphereBody,
        sphere2Position: Vec3,
        sphere2Shape: SphereBody
    ): Vec3 | undefined {
        const distance = vec3.distance(sphere1Position, sphere2Position);
        const sumOfRadii = sphere1Shape.radius + sphere2Shape.radius;
        if (distance > sumOfRadii) {
            return undefined;
        }

        const contactNormal = new Vec3();
        vec3.subtract(contactNormal, sphere1Position, sphere2Position);
        vec3.normalize(contactNormal, contactNormal);
        vec3.scale(contactNormal, contactNormal, sumOfRadii - distance);

        return contactNormal;
    }
}
