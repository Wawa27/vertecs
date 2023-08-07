import { vec3 } from "gl-matrix";
import Quadtree from "../../src/physics/broadphase/quadtree/Quadtree";
import AxisAlignedBoundingBox from "../../src/physics/AxisAlignedBoundingBox";
import { Entity, Transform } from "../../src";

describe("Quadtree", () => {
    describe("addEntity", () => {
        it("should add an entity within bounds", () => {
            const bounds = new AxisAlignedBoundingBox(
                vec3.fromValues(0, 0, 0),
                vec3.fromValues(100, 100, 100)
            );
            const quadtree = new Quadtree(bounds);

            const entity = new Entity(); // Create or mock an Entity
            const transform = new Transform(); // Create or mock a Transform
            transform.setPosition(vec3.fromValues(50, 50, 50));
            entity.addComponent(transform);

            quadtree.addEntity(entity);
        });
    });
});
