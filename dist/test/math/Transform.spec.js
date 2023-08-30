import { assert } from "chai";
import { quat, Quat, vec3 } from "ts-gl-matrix";
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
        it("should have the same scale if set in world space twice", () => {
            const parentScale = vec3.fromValues(10, 10, 10);
            const worldScale = vec3.fromValues(1, 1, 1);
            const parentEntity = new Entity();
            const childEntity = new Entity();
            parentEntity.addComponent(new Transform(undefined, undefined, parentScale));
            const childTransform = new Transform();
            childEntity.addComponent(childTransform);
            parentEntity.addChild(childEntity);
            childTransform.setWorldScale(worldScale);
            childTransform.setWorldScale(worldScale);
            const expectedScale = vec3.fromValues(0.1, 0.1, 0.1);
            assert.deepEqual(childTransform.scaling, expectedScale);
            assert.isTrue(childTransform.dirty);
        });
    });
    describe("Look at", () => {
        it("should look at the given position", () => {
            const transform = new Transform();
            const position = vec3.fromValues(1, 0, 0);
            transform.lookAt(position);
            assert.isTrue(Quat.equals(transform.rotation, Quat.fromEuler(new Quat(), 0, -90, 0)));
        });
    });
});
