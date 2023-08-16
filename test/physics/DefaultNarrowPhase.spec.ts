import { Vec3, vec3 } from "ts-gl-matrix";
import { assert } from "chai";
import { DefaultNarrowphase, SphereBody } from "../../src";

describe("Default Narrowphase", () => {
    const narrowphase = new DefaultNarrowphase();

    it("should return undefined when no collision occurs", () => {
        // Two spheres not colliding
        const sphere1Position = vec3.fromValues(0, 0, 0);
        const sphere1Shape = new SphereBody({
            radius: 1,
        });
        const sphere2Position = vec3.fromValues(5, 0, 0);
        const sphere2Shape = new SphereBody({
            radius: 1,
        });

        const collisionNormal = narrowphase.getSphereSphereCollision(
            sphere1Position,
            sphere1Shape,
            sphere2Position,
            sphere2Shape
        );

        assert.isUndefined(collisionNormal);
    });

    it("should calculate the correct collision normal when collision occurs", () => {
        // Two spheres colliding along the x-axis
        const sphere1Position = vec3.fromValues(0, 0, 0);
        const sphere1Shape = new SphereBody({
            radius: 1,
            movable: false,
        });
        const sphere2Position = vec3.fromValues(2, 0, 0);
        const sphere2Shape = new SphereBody({
            radius: 1,
            movable: true,
        });

        const collisionNormal = narrowphase.getSphereSphereCollision(
            sphere1Position,
            sphere1Shape,
            sphere2Position,
            sphere2Shape
        );
        const expectedCollisionNormal = new Vec3([0, 0, 0]);

        assert.isTrue(Vec3.equals(collisionNormal!, expectedCollisionNormal));
    });
});
