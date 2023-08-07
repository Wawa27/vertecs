import { vec3 } from "gl-matrix";
import SphereBody from "../bodies/SphereBody";
import Narrowphase from "./Narrowphase";

export default class DefaultNarrowphase implements Narrowphase {
    public constructor() {}

    public getSphereSphereCollision(
        sphere1Position: vec3,
        sphere1Shape: SphereBody,
        sphere2Position: vec3,
        sphere2Shape: SphereBody
    ): vec3 | undefined {
        const distance = vec3.distance(sphere1Position, sphere2Position);
        const sumOfRadii = sphere1Shape.radius + sphere2Shape.radius;
        if (distance > sumOfRadii) {
            return undefined;
        }

        const contactNormal = vec3.create();
        vec3.subtract(contactNormal, sphere1Position, sphere2Position);
        vec3.normalize(contactNormal, contactNormal);

        return contactNormal;
    }
}
