import { vec3 } from "ts-gl-matrix";
import { assert } from "chai";
import Quadtree from "../../src/physics/broadphase/quadtree/Quadtree";
import AxisAlignedBoundingBox from "../../src/physics/AxisAlignedBoundingBox";
import { Entity, SphereBody, Transform } from "../../src";

describe("Quadtree", () => {
    describe("addEntity", () => {
        it("should add an entity within bounds", () => {
            const bounds = new AxisAlignedBoundingBox(
                vec3.fromValues(0, 0, 0),
                vec3.fromValues(100, 100, 100)
            );
            const quadtree = new Quadtree(bounds);

            const entity = new Entity(); // Create or mock an Entity
            const transform = new Transform([50, 50, 50]); // Create or mock a Transform
            entity.addComponent(transform);
            entity.addComponent(
                new SphereBody({
                    radius: 1,
                })
            );

            quadtree.addEntity(entity);
        });
    });

    describe("removeEntity", () => {
        it("should remove an entity", () => {
            const quadtree = new Quadtree(
                new AxisAlignedBoundingBox(
                    vec3.fromValues(0, 0, 0),
                    vec3.fromValues(100, 100, 100)
                )
            );
            const entity = new Entity();
            const transform = new Transform();
            const body = new SphereBody({
                radius: 1,
            });
            entity.addComponents(transform, body);

            quadtree.addEntity(entity);
            quadtree.removeEntity(entity, [body, transform]);

            assert.isUndefined(quadtree.quadrants[0]);
        });
    });
});
