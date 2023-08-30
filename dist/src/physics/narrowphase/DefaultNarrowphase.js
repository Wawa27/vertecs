import { Vec3, vec3 } from "ts-gl-matrix";
export default class DefaultNarrowphase {
    constructor() { }
    getSphereSphereCollision(sphere1Position, sphere1Shape, sphere2Position, sphere2Shape) {
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
