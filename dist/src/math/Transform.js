/**
 * A transform represents a position, rotation and a scale, it may have a parent Transform,
 *
 * Global position, rotation and scale are only updated when dirty and queried,
 * parents are updated from the current transform up to the root transform.
 */
import { mat4, Mat4, Quat, Vec3, } from "ts-gl-matrix";
import { Component } from "../core";
export default class Transform extends Component {
    /**
     * The result of the post-multiplication of all the parents of this transform
     * This matrix is only updated when queried and dirty
     * @private
     */
    modelToWorldMatrix;
    /**
     * The inverse of {@see modelToWorldMatrix}
     * This matrix is only updated when queried and dirty
     * @private
     */
    worldToModelMatrix;
    /**
     * The result of Translation * Rotation * Scale
     * This matrix is only updated when queried and dirty
     * @private
     */
    modelMatrix;
    /**
     * The current position
     * @private
     */
    position;
    /**
     * The current rotation
     * @private
     */
    rotation;
    /**
     * The current scale
     * @private
     */
    scaling;
    dirty;
    forward;
    /**
     * The parent transform
     * @private
     */
    parent;
    #worldPosition;
    #worldRotation;
    #worldScale;
    /**
     * Creates a new transform
     * @param translation Specifies the translation, will be copied using {@link Vec3.copy}
     * @param rotation Specifies the rotation, will be copied using {@link Quat.copy}
     * @param scaling Specifies the scale, will be copied using {@link Vec3.copy}
     * @param forward Specifies the forward vector, will be copied using {@link Vec3.copy}
     */
    constructor(translation, rotation, scaling, forward) {
        super();
        this.modelMatrix = Mat4.create();
        this.modelToWorldMatrix = Mat4.create();
        this.worldToModelMatrix = Mat4.create();
        this.position = Vec3.create();
        this.rotation = Quat.create();
        this.scaling = Vec3.fromValues(1, 1, 1);
        this.forward = forward ?? Vec3.fromValues(0, 0, 1);
        this.#worldPosition = Vec3.create();
        this.#worldRotation = Quat.create();
        this.#worldScale = Vec3.create();
        if (translation)
            Vec3.copy(this.position, translation);
        if (rotation)
            Quat.copy(this.rotation, rotation);
        if (scaling)
            Vec3.copy(this.scaling, scaling);
        this.dirty = true;
    }
    /**
     * Set this transform's parent to the entity's parent
     * @param entity The entity this transform is attached to
     */
    onAddedToEntity(entity) {
        if (entity.parent) {
            this.setNewParent(entity.parent);
        }
    }
    /**
     * Remove this transform's parent
     * @param entity The entity this transform was attached to
     */
    onRemovedFromEntity(entity) {
        this.parent = undefined;
    }
    /**
     * Called whenever the attached entity parent change
     * @param parent The new parent entity
     */
    onEntityNewParent(parent) {
        this.setNewParent(parent);
    }
    setNewParent(parent) {
        if (!parent.getComponent(Transform)) {
            parent.addComponent(new Transform());
        }
        this.parent = parent.getComponent(Transform);
        this.dirty = true;
    }
    onDestroyed() { }
    static fromMat4(matrix) {
        const transform = new Transform();
        transform.copy(matrix);
        return transform;
    }
    /**
     * Copy the translation, rotation and scaling of the transform
     * @param transform The transform to copy from
     */
    copy(transform) {
        Mat4.getTranslation(this.position, transform);
        Mat4.getRotation(this.rotation, transform);
        Mat4.getScaling(this.scaling, transform);
        this.dirty = true;
    }
    /**
     * Translate this transform using a translation vector
     * @param translation The translation vector
     */
    translate(translation) {
        Vec3.add(this.position, this.position, translation);
        this.dirty = true;
    }
    setWorldRotation(rotation) {
        const inverseWorldRotation = Quat.invert(Quat.create(), this.getWorldRotation());
        Quat.multiply(this.rotation, this.rotation, inverseWorldRotation);
        Quat.mul(this.rotation, this.rotation, rotation);
        this.dirty = true;
    }
    /**
     * Reset the position, rotation, and scale to the default values
     */
    reset() {
        Vec3.set(this.position, 0, 0, 0);
        this.resetRotation();
        Vec3.set(this.scaling, 1, 1, 1);
        this.dirty = true;
    }
    /**
     * Reset the rotation to the default values
     */
    resetRotation() {
        Quat.set(this.rotation, 0, 0, 0, 1);
        this.dirty = true;
    }
    /**
     * Rotate this transform in the x axis
     * @param x An angle in radians
     */
    rotateX(x) {
        Quat.rotateX(this.rotation, this.rotation, x);
        this.dirty = true;
    }
    /**
     * Rotate this transform in the y axis
     * @param y An angle in radians
     */
    rotateY(y) {
        Quat.rotateY(this.rotation, this.rotation, y);
        this.dirty = true;
    }
    /**
     * Rotate this transform in the y axis
     * @param z An angle in radians
     */
    rotateZ(z) {
        Quat.rotateZ(this.rotation, this.rotation, z);
        this.dirty = true;
    }
    rotate(rotation) {
        Quat.mul(this.rotation, this.rotation, rotation);
        this.dirty = true;
    }
    setWorldScale(scale) {
        const inverseScale = Vec3.inverse(Vec3.create(), this.getWorldScale());
        Vec3.mul(this.scaling, this.scaling, inverseScale);
        Vec3.mul(this.scaling, this.scaling, scale);
        this.dirty = true;
    }
    scale(scale) {
        Vec3.multiply(this.scaling, this.scaling, scale);
        this.dirty = true;
    }
    setScale(scale) {
        Vec3.copy(this.scaling, scale);
        this.dirty = true;
    }
    setRotationQuat(rotation) {
        Quat.copy(this.rotation, rotation);
        this.dirty = true;
    }
    /**
     * Updates the model to world matrix of this transform and returns it
     * It update all the parents until no one is dirty
     */
    updateModelToWorldMatrix() {
        if (!this.dirty && !this.parent?.dirty) {
            return this.modelToWorldMatrix;
        }
        // Update the model matrix
        Mat4.fromRotationTranslationScale(this.modelMatrix, this.rotation, this.position, this.scaling);
        // If the object has a parent, multiply its matrix with the parent's
        if (this.parent) {
            const parentMatrix = this.parent.updateModelToWorldMatrix();
            Mat4.mul(this.modelToWorldMatrix, parentMatrix, this.modelMatrix);
        }
        else {
            Mat4.copy(this.modelToWorldMatrix, this.modelMatrix);
        }
        Mat4.getTranslation(this.#worldPosition, this.modelToWorldMatrix);
        Mat4.getRotation(this.#worldRotation, this.modelToWorldMatrix);
        Mat4.getScaling(this.#worldScale, this.modelToWorldMatrix);
        return this.modelToWorldMatrix;
    }
    getWorldToModelMatrix() {
        return Mat4.invert(this.worldToModelMatrix, this.updateModelToWorldMatrix());
    }
    getWorldPosition() {
        if (this.dirty) {
            this.updateModelToWorldMatrix();
        }
        return this.#worldPosition;
    }
    /**
     * Get the world scale of this transform
     */
    getWorldScale() {
        if (this.dirty) {
            this.updateModelToWorldMatrix();
        }
        return this.#worldScale;
    }
    /**
     * Get the world rotation of this transform
     */
    getWorldRotation() {
        if (this.dirty) {
            this.updateModelToWorldMatrix();
        }
        return this.#worldRotation;
    }
    getWorldForwardVector(out) {
        const worldRotation = this.getWorldRotation();
        Vec3.normalize(out, Vec3.transformQuat(Vec3.create(), this.forward, worldRotation));
        return out;
    }
    getVectorInModelSpace(out, vector) {
        this.updateModelToWorldMatrix();
        Mat4.invert(this.worldToModelMatrix, this.modelToWorldMatrix);
        Vec3.transformMat4(out, vector, this.worldToModelMatrix);
        return out;
    }
    getVectorInWorldSpace(out, vector) {
        Vec3.transformMat4(out, vector, this.updateModelToWorldMatrix());
        return out;
    }
    toWorldScale(out, scale) {
        Vec3.mul(out, scale, Vec3.inverse(Vec3.create(), this.getWorldScale()));
        return out;
    }
    /**
     * Make this transform look at the specified position
     * @param x
     * @param y
     * @param z
     */
    lookAtXyz(x, y, z) {
        const lookAtMatrix = Mat4.create();
        mat4.targetTo(lookAtMatrix, [x, y, z], this.getWorldPosition(), [0, 1, 0]);
        Mat4.getRotation(this.rotation, lookAtMatrix);
        this.dirty = true;
    }
    lookAt(position) {
        this.lookAtXyz(position[0], position[1], position[2]);
    }
    setWorldUnitScale() {
        const modelToWorldMatrix = this.updateModelToWorldMatrix();
        const scale = Vec3.create(); // TODO: Cache this
        const currentScale = Vec3.create(); // TODO: Cache this
        Vec3.div(scale, [1, 1, 1], Mat4.getScaling(currentScale, modelToWorldMatrix));
        this.scale(scale);
    }
    setWorldPosition(position) {
        const worldPosition = this.getWorldPosition();
        Vec3.sub(position, position, worldPosition);
        Vec3.add(this.position, this.position, position);
        this.dirty = true;
    }
    /**
     * Set the current position
     * @param position Specifies the new position, will be copied using {@link Vec3.copy}
     */
    setPosition(position) {
        Vec3.copy(this.position, position);
        this.dirty = true;
    }
    setForward(forward) {
        Vec3.copy(this.forward, forward);
        this.dirty = true;
    }
    /**
     * Return a new Transform with the same position, rotation, scaling, but no parent
     */
    clone() {
        return new Transform(this.position, this.rotation, this.scaling);
    }
}
