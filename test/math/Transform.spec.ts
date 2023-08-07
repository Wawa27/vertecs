import { assert } from "chai";
import { vec3, quat } from "gl-matrix";
import { Entity, Transform } from "../../src";

describe("Transform", () => {
    it("should initialize with default values", () => {
        const transform = new Transform();

        assert.deepEqual(transform.position, vec3.fromValues(0, 0, 0));
        assert.deepEqual(transform.rotation, quat.create());
        assert.deepEqual(transform.scaling, vec3.fromValues(1, 1, 1));
    });

    it("should initialize with given translation, rotation, and scaling", () => {
        const translation = vec3.fromValues(1, 2, 3);
        const rotation = quat.fromValues(0, 1, 0, 1);
        const scaling = vec3.fromValues(2, 2, 2);

        const transform = new Transform(translation, rotation, scaling);

        assert.deepEqual(transform.position, translation);
        assert.deepEqual(transform.rotation, rotation);
        assert.deepEqual(transform.scaling, scaling);
    });

    it("should translate correctly", () => {
        const transform = new Transform();
        const translation = vec3.fromValues(1, 2, 3);
        transform.translate(translation);

        assert.deepEqual(transform.position, translation);
        assert.isTrue(transform.dirty);
    });

    it("should rotate in the x axis", () => {
        const transform = new Transform();
        const angle = Math.PI / 4;
        transform.rotateX(angle);

        assert.approximately(transform.rotation[0], Math.sin(angle / 2), 1e-6);
        assert.isTrue(transform.dirty);
    });

    describe("World space", () => {
        it("should get the correct world position with parent", () => {
            const parentTranslation = vec3.fromValues(1, 2, 3);
            const childTranslation = vec3.fromValues(4, 5, 6);

            const parentEntity = new Entity();
            const childEntity = new Entity();

            parentEntity.addComponent(new Transform(parentTranslation));
            childEntity.addComponent(new Transform(childTranslation));
            parentEntity.addChild(childEntity);

            const worldPosition = vec3.create();
            childEntity
                .getComponent(Transform)
                ?.getWorldPosition(worldPosition);

            const expectedWorldPosition = vec3.fromValues(5, 7, 9);
            assert.deepEqual(worldPosition, expectedWorldPosition);
        });

        it("should set the correct world position with parent", () => {
            const parentTranslation = vec3.fromValues(1, 2, 3);
            const worldPosition = vec3.fromValues(4, 5, 6);

            const parentEntity = new Entity();
            const childEntity = new Entity();

            parentEntity.addComponent(new Transform(parentTranslation));
            const childTransform = new Transform();
            childEntity.addComponent(childTransform);

            parentEntity.addChild(childEntity);

            childTransform.setWorldPosition(worldPosition);

            const expectedPosition = vec3.fromValues(3, 3, 3);
            assert.deepEqual(childTransform.position, expectedPosition);
            assert.isTrue(childTransform.dirty);
        });
    });
});
