/**
 * A transform represents a position, rotation and a scale, it may have a parent Transform,
 *
 * Global position, rotation and scale are only updated when dirty and queried,
 * parents are updated from the current transform up to the root transform.
 */
import { mat4, quat, vec3 } from "gl-matrix";
import { Component, Entity } from "../core";

export default class Transform extends Component {
    /**
     * The result of the post-multiplication of all the parents of this transform
     * This matrix is only updated when queried and dirty
     * @private
     */
    readonly modelToWorldMatrix: mat4;

    /**
     * The inverse of {@see modelToWorldMatrix}
     * This matrix is only updated when queried and dirty
     * @private
     */
    readonly worldToModelMatrix: mat4;

    /**
     * The result of Translation * Rotation * Scale
     * This matrix is only updated when queried and dirty
     * @private
     */
    readonly modelMatrix: mat4;

    /**
     * The current position
     * @private
     */
    readonly position: vec3;

    /**
     * The current rotation
     * @private
     */
    readonly rotation: quat;

    /**
     * The current scale
     * @private
     */
    readonly scaling: vec3;

    dirty: boolean;

    forward: vec3;

    /**
     * The parent transform
     * @private
     */
    parent?: Transform;

    /**
     * Creates a new transform
     * @param translation Specifies the translation, will be copied using {@link vec3.copy}
     * @param rotation Specifies the rotation, will be copied using {@link quat.copy}
     * @param scaling Specifies the scale, will be copied using {@param forward @link vec3.copy}
     */
    public constructor(
        translation?: vec3,
        rotation?: quat,
        scaling?: vec3,
        forward?: vec3
    ) {
        super();

        this.modelMatrix = mat4.create();
        this.modelToWorldMatrix = mat4.create();
        this.worldToModelMatrix = mat4.create();
        this.position = vec3.create();
        this.rotation = quat.create();
        this.scaling = vec3.fromValues(1, 1, 1);
        this.forward = forward ?? vec3.fromValues(0, 0, -1);

        if (translation) vec3.copy(this.position, translation);
        if (rotation) quat.copy(this.rotation, rotation);
        if (scaling) vec3.copy(this.scaling, scaling);

        this.dirty = true;
    }

    /**
     * Set this transform's parent to the entity's parent
     * @param entity The entity this transform is attached to
     */
    public onAddedToEntity(entity: Entity) {
        if (entity.parent) {
            this.setNewParent(entity.parent);
        }
    }

    /**
     * Remove this transform's parent
     * @param entity The entity this transform was attached to
     */
    public onRemovedFromEntity(entity: Entity): void {
        this.parent = undefined;
    }

    /**
     * Called whenever the attached entity parent change
     * @param parent The new parent entity
     */
    public onEntityParentChanged(parent: Entity): void {
        this.setNewParent(parent);
    }

    private setNewParent(parent: Entity): void {
        if (!parent.getComponent(Transform)) {
            parent.addComponent(new Transform());
        }
        this.parent = parent.getComponent(Transform);
        this.dirty = true;
    }

    public onDestroyed(): void {}

    public static fromMat4(matrix: mat4): Transform {
        const transform = new Transform();
        transform.copy(matrix);
        return transform;
    }

    /**
     * Copy the translation, rotation and scaling of the transform
     * @param transform The transform to copy from
     */
    public copy(transform: mat4) {
        mat4.getTranslation(this.position, transform);
        mat4.getRotation(this.rotation, transform);
        mat4.getScaling(this.scaling, transform);
        this.dirty = true;
    }

    /**
     * Translate this transform using a translation vector
     * @param translation The translation vector
     */
    public translate(translation: vec3): void {
        vec3.add(this.position, this.position, translation);
        this.dirty = true;
    }

    /**
     * Set this transform position relative to the world instead of the model
     * @param target The world position
     */
    public setWorldPosition(target: vec3): void {
        const translation = vec3.transformMat4(
            target,
            target,
            this.getWorldToModelMatrix()
        );
        this.setPosition(translation);
    }

    public setWorldPositionXYZ(x: number, y: number, z: number): void {
        this.setWorldPosition([x, y, z]);
    }

    public setWorldRotation(rotation: quat): void {
        // TODO: Cache this
        const worldRotation = mat4.getRotation(
            quat.create(),
            this.updateAndGetModelToWorldMatrix()
        );
        // TODO: Cache this
        const inverseWorldRotation = quat.invert(quat.create(), worldRotation);
        quat.mul(inverseWorldRotation, inverseWorldRotation, rotation);
        this.rotate(inverseWorldRotation);
    }

    /**
     * Reset the position, rotation, and scale to the default values
     */
    public reset(): void {
        vec3.set(this.position, 0, 0, 0);
        this.resetRotation();
        vec3.set(this.scaling, 1, 1, 1);
        this.dirty = true;
    }

    /**
     * Reset the rotation to the default values
     */
    public resetRotation(): void {
        quat.set(this.rotation, 0, 0, 0, 1);
        this.dirty = true;
    }

    /**
     * Rotate this transform in the x axis
     * @param x An angle in radians
     */
    public rotateX(x: number): void {
        quat.rotateX(this.rotation, quat.create(), x);
        this.dirty = true;
    }

    /**
     * Rotate this transform in the y axis
     * @param y An angle in radians
     */
    public rotateY(y: number): void {
        quat.rotateY(this.rotation, this.rotation, y);
        this.dirty = true;
    }

    /**
     * Rotate this transform in the y axis
     * @param z An angle in radians
     */
    public rotateZ(z: number): void {
        quat.rotateZ(this.rotation, quat.create(), z);
        this.dirty = true;
    }

    public rotate(rotation: quat): void {
        quat.mul(this.rotation, this.rotation, rotation);
        this.dirty = true;
    }

    public setWorldScale(scale: vec3): void {
        const inverseScale = mat4.getScaling(
            vec3.create(),
            this.getWorldToModelMatrix()
        );
        this.setScale(vec3.mul(inverseScale, inverseScale, scale));
    }

    public scale(scale: vec3): void {
        vec3.multiply(this.scaling, this.scaling, scale);
        this.dirty = true;
    }

    public setScale(scale: vec3) {
        vec3.copy(this.scaling, scale);
        this.dirty = true;
    }

    public setRotationQuat(rotation: quat): void {
        quat.copy(this.rotation, rotation);
        this.dirty = true;
    }

    /**
     * Updates the model to world matrix of this transform and returns it
     * It update all the parents until no one is dirty
     */
    public updateAndGetModelToWorldMatrix(): mat4 {
        if (this.dirty) {
            // Update the model matrix
            mat4.fromRotationTranslationScale(
                this.modelMatrix,
                this.rotation,
                this.position,
                this.scaling
            );

            if (this.parent) {
                // Post multiply the model to world matrix with the parent model to world matrix
                this.parent.updateAndGetModelToWorldMatrix();
                return mat4.mul(
                    this.modelToWorldMatrix,
                    this.parent?.updateAndGetModelToWorldMatrix(),
                    this.modelMatrix
                );
            }
            return mat4.copy(this.modelToWorldMatrix, this.modelMatrix);
        }

        return this.modelToWorldMatrix;
    }

    public getWorldToModelMatrix(): mat4 {
        return mat4.invert(
            this.worldToModelMatrix,
            this.updateAndGetModelToWorldMatrix()
        );
    }

    /**
     * Get the world position
     * @param out The world position
     */
    public getWorldPosition(out: vec3): vec3 {
        return mat4.getTranslation(out, this.updateAndGetModelToWorldMatrix());
    }

    /**
     * Get the world scale of this transform
     * @param out The world scale
     */
    public getWorldScale(out: vec3): vec3 {
        return mat4.getScaling(out, this.updateAndGetModelToWorldMatrix());
    }

    /**
     * Get the world rotation of this transform
     * @param out The world rotation
     */
    public getWorldRotation(out: quat): quat {
        return mat4.getRotation(out, this.updateAndGetModelToWorldMatrix());
    }

    public getWorldForward(): vec3 {
        const worldRotation = this.getWorldRotation(quat.create());
        return vec3.transformQuat(vec3.create(), this.forward, worldRotation);
    }

    public toWorldPosition(out: vec3, position: vec3) {
        vec3.transformMat4(
            out,
            position,
            this.updateAndGetModelToWorldMatrix()
        );
    }

    public lookAtXyz(x: number, y: number, z: number): void {
        const lookAt = mat4.targetTo(
            mat4.create(),
            this.position,
            [x, y, z],
            [0, 1, 0]
        );
        mat4.getRotation(this.rotation, lookAt);
        this.dirty = true;
    }

    public lookAt(position: vec3): void {
        this.lookAtXyz(position[0], position[1], position[2]);
    }

    public setWorldUnitScale(): void {
        const modelToWorldMatrix = this.updateAndGetModelToWorldMatrix();

        const scale = vec3.create(); // TODO: Cache this
        const currentScale = vec3.create(); // TODO: Cache this
        vec3.div(
            scale,
            [1, 1, 1],
            mat4.getScaling(currentScale, modelToWorldMatrix)
        );

        this.scale(scale);
    }

    /**
     * Set the current position
     * @param position Specifies the new position, will be copied using {@link vec3.copy}
     */
    public setPosition(position: vec3) {
        vec3.copy(this.position, position);
        this.dirty = true;
    }

    /**
     * Return a new Transform with the same position, rotation, scaling, but no parent
     */
    public clone(): Component {
        return new Transform(this.position, this.rotation, this.scaling);
    }
}
