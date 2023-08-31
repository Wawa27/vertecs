import QuadtreeBroadphase from "../../../src/physics/broadphase/quadtree/QuadtreeBroadphase";
import { Entity, SphereBody, Transform } from "../../../src";

describe("QuadtreeBroadphase", () => {
    let broadphase: QuadtreeBroadphase;

    beforeEach(() => {
        broadphase = new QuadtreeBroadphase([0, 0, 0], [100, 100, 100]);
    });

    it("should add an entity to the quadtree", () => {
        const entity = new Entity();
        const body = new SphereBody({
            radius: 1,
        });
        const transform = new Transform();
        entity.addComponents(body, transform);
        broadphase.onEntityAdded(entity, [body, transform]);
    });

    it("should remove an entity from the quadtree", () => {
        const entity = new Entity();
        const body = new SphereBody({
            radius: 1,
        });
        const transform = new Transform();
        entity.addComponents(body, transform);
        broadphase.onEntityAdded(entity, [body, transform]);
        broadphase.onEntityRemoved(entity, [body, transform]);
    });

    it("should add two entities to the quadtree", () => {
        const entity1 = new Entity();
        const transform1 = new Transform();
        const body1 = new SphereBody({
            radius: 1,
        });
        entity1.addComponents(body1, transform1);
        broadphase.onEntityAdded(entity1, [body1, transform1]);

        const entity2 = new Entity();
        const transform2 = new Transform();
        const body2 = new SphereBody({
            radius: 1,
        });
        entity2.addComponents(body2, transform2);
        broadphase.onEntityAdded(entity2, [body2, transform2]);

        broadphase.getCollisionPairs([entity1, entity2]);
    });
});
