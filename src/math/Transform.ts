/**
 * A transform represents a position, rotation and a scale, it may have a parent Transform,
 *
 * Global position, rotation and scale are only updated when dirty and queried,
 * parents are updated from the current transform up to the root transform.
 */
import {
    mat4,
    Mat4,
    Mat4Like,
    Quat,
    QuatLike,
    vec3,
    Vec3,
    Vec3Like,
} from "ts-gl-matrix";
import { Component, Entity } from "../core";

export default class Transform extends Component {
    /**
     * The result of the post-multiplication of all the parents of this transform
     * This matrix is only updated when queried and dirty
     * @private
     */
    readonly modelToWorldMatrix: Mat4;

    /**
     * The inverse of {@see modelToWorldMatrix}
     * This matrix is only updated when queried and dirty
     * @private
     */
    readonly worldToModelMatrix: Mat4;

    /**
     * The result of Translation * Rotation * Scale
     * This matrix is only updated when queried and dirty
     * @private
     */
    readonly modelMatrix: Mat4;

    /**
     * The current position
     * @private
     */
    readonly position: Vec3;

    /**
     * The current rotation
     * @private
     */
    readonly rotation: Quat;

    /**
     * The current scale
     * @private
     */
    readonly scaling: Vec3;

    dirty: boolean;

    forward: Vec3;

    /**
     * The parent transform
     * @private
     */
    parent?: Transform;

    #worldPosition: Vec3;

    #worldRotation: Quat;

    #worldScale: Vec3;

    /**
     * Creates a new transform
     * @param translation Specifies the translation, will be copied using {@link Vec3.copy}
     * @param rotation Specifies the rotation, will be copied using {@link Quat.copy}
     * @param scaling Specifies the scale, will be copied using {@link Vec3.copy}
     * @param forward Specifies the forward vector, will be copied using {@link Vec3.copy}
     */
    public constructor(
        translation?: Vec3Like,
        rotation?: QuatLike,
        scaling?: Vec3Like,
        forward?: Vec3
    ) {
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

        if (translation) Vec3.copy(this.position, translation);
        if (rotation) Quat.copy(this.rotation, rotation);
        if (scaling) Vec3.copy(this.scaling, scaling);

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
    public onEntityNewParent(parent: Entity): void {
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

    public static fromMat4(matrix: Mat4): Transform {
        const transform = new Transform();
        transform.copy(matrix);
        return transform;
    }

    /**
     * Copy the translation, rotation and scaling of the transform
     * @param transform The transform to copy from
     */
    public copy(transform: Mat4) {
        Mat4.getTranslation(this.position, transform);
        Mat4.getRotation(this.rotation, transform);
        Mat4.getScaling(this.scaling, transform);
        this.dirty = true;
    }

    /**
     * Translate this transform using a translation vector
     * @param translation The translation vector
     */
    public translate(translation: Vec3Like): void {
        Vec3.add(this.position, this.position, translation);
        this.dirty = true;
    }

    public setWorldRotation(rotation: QuatLike): void {
        const inverseWorldRotation = Quat.invert(
            Quat.create(),
            this.getWorldRotation()
        );
        Quat.multiply(this.rotation, this.rotation, inverseWorldRotation);
        Quat.mul(this.rotation, this.rotation, rotation);
        this.dirty = true;
    }

    /**
     * Reset the position, rotation, and scale to the default values
     */
    public reset(): void {
        Vec3.set(this.position, 0, 0, 0);
        this.resetRotation();
        Vec3.set(this.scaling, 1, 1, 1);
        this.dirty = true;
    }

    /**
     * Reset the rotation to the default values
     */
    public resetRotation(): void {
        Quat.set(this.rotation, 0, 0, 0, 1);
        this.dirty = true;
    }

    /**
     * Rotate this transform in the x axis
     * @param x An angle in radians
     */
    public rotateX(x: number): void {
        Quat.rotateX(this.rotation, this.rotation, x);
        this.dirty = true;
    }

    /**
     * Rotate this transform in the y axis
     * @param y An angle in radians
     */
    public rotateY(y: number): void {
        Quat.rotateY(this.rotation, this.rotation, y);
        this.dirty = true;
    }

    /**
     * Rotate this transform in the y axis
     * @param z An angle in radians
     */
    public rotateZ(z: number): void {
        Quat.rotateZ(this.rotation, this.rotation, z);
        this.dirty = true;
    }

    public rotate(rotation: QuatLike): void {
        Quat.mul(this.rotation, this.rotation, rotation);
        this.dirty = true;
    }

    public setWorldScale(scale: Vec3Like): void {
        const inverseScale = Vec3.inverse(Vec3.create(), this.getWorldScale());
        Vec3.mul(this.scaling, this.scaling, inverseScale);
        Vec3.mul(this.scaling, this.scaling, scale);
        this.dirty = true;
    }

    public scale(scale: Vec3Like): void {
        Vec3.multiply(this.scaling, this.scaling, scale);
        this.dirty = true;
    }

    public setScale(scale: Vec3Like) {
        Vec3.copy(this.scaling, scale);
        this.dirty = true;
    }

    public setRotationQuat(rotation: QuatLike): void {
        Quat.copy(this.rotation, rotation);
        this.dirty = true;
    }

    /**
     * Updates the model to world matrix of this transform and returns it
     * It update all the parents until no one is dirty
     */
    public updateModelToWorldMatrix(): Mat4 {
        if (!this.dirty && !this.parent?.dirty) {
            return this.modelToWorldMatrix;
        }

        // Update the model matrix
        Mat4.fromRotationTranslationScale(
            this.modelMatrix,
            this.rotation,
            this.position,
            this.scaling
        );

        // If the object has a parent, multiply its matrix with the parent's
        if (this.parent) {
            const parentMatrix = this.parent.updateModelToWorldMatrix();

            Mat4.mul(this.modelToWorldMatrix, parentMatrix, this.modelMatrix);
        } else {
            Mat4.copy(this.modelToWorldMatrix, this.modelMatrix);
        }

        Mat4.getTranslation(this.#worldPosition, this.modelToWorldMatrix);
        Mat4.getRotation(this.#worldRotation, this.modelToWorldMatrix);
        Mat4.getScaling(this.#worldScale, this.modelToWorldMatrix);

        return this.modelToWorldMatrix;
    }

    public getWorldToModelMatrix(): Mat4Like {
        return Mat4.invert(
            this.worldToModelMatrix,
            this.updateModelToWorldMatrix()
        );
    }

    public getWorldPosition(): Vec3 {
        if (this.dirty) {
            this.updateModelToWorldMatrix();
        }
        return this.#worldPosition;
    }

    /**
     * Get the world scale of this transform
     */
    public getWorldScale(): Vec3 {
        if (this.dirty) {
            this.updateModelToWorldMatrix();
        }
        return this.#worldScale;
    }

    /**
     * Get the world rotation of this transform
     */
    public getWorldRotation(): Quat {
        if (this.dirty) {
            this.updateModelToWorldMatrix();
        }
        return this.#worldRotation;
    }

    /**
     * Return the world space distance from the specified transform
     * @param transform
     */
    public getWorldDistanceFrom(transform: Transform): number {
        return vec3.distance(
            this.getWorldPosition(),
            transform.getWorldPosition()
        );
    }

    public getWorldForwardVector(out: Vec3): Vec3 {
        const worldRotation = this.getWorldRotation();
        Vec3.normalize(
            out,
            Vec3.transformQuat(Vec3.create(), this.forward, worldRotation)
        );
        return out;
    }

    public getVectorInModelSpace(out: Vec3, vector: Vec3Like): Vec3 {
        this.updateModelToWorldMatrix();
        Mat4.invert(this.worldToModelMatrix, this.modelToWorldMatrix);
        Vec3.transformMat4(out, vector, this.worldToModelMatrix);
        return out;
    }

    public getVectorInWorldSpace(out: Vec3, vector: Vec3): Vec3 {
        Vec3.transformMat4(out, vector, this.updateModelToWorldMatrix());
        return out;
    }

    public toWorldScale(out: Vec3, scale: Vec3Like): Vec3 {
        Vec3.mul(out, scale, Vec3.inverse(Vec3.create(), this.getWorldScale()));
        return out;
    }

    /**
     * Make this transform look at the specified position
     * @param x
     * @param y
     * @param z
     */
    public targetToXyz(x: number, y: number, z: number): void {
        const lookAtMatrix = Mat4.create();
        mat4.targetTo(
            lookAtMatrix,
            this.getWorldPosition(),
            [x, y, z],
            [0, 1, 0]
        );
        Mat4.getRotation(this.rotation, lookAtMatrix);
        this.dirty = true;
    }

    public targetTo(position: Vec3): void {
        this.targetToXyz(position[0], position[1], position[2]);
    }

    public lookAtXyz(x: number, y: number, z: number) {
        const lookAtMatrix = Mat4.create();
        mat4.targetTo(
            lookAtMatrix,
            [x, y, z],
            this.getWorldPosition(),
            [0, 1, 0]
        );
        Mat4.getRotation(this.rotation, lookAtMatrix);
        this.dirty = true;
    }

    public lookAt(target: Vec3) {
        return this.lookAtXyz(target[0], target[1], target[2]);
    }

    public setWorldUnitScale(): void {
        const modelToWorldMatrix = this.updateModelToWorldMatrix();

        const scale = Vec3.create(); // TODO: Cache this
        const currentScale = Vec3.create(); // TODO: Cache this
        Vec3.div(
            scale,
            [1, 1, 1],
            Mat4.getScaling(currentScale, modelToWorldMatrix)
        );

        this.scale(scale);
    }

    public setWorldPosition(position: Vec3Like): void {
        const worldPosition = this.getWorldPosition();
        Vec3.sub(position, position, worldPosition);
        Vec3.add(this.position, this.position, position);
        this.dirty = true;
    }

    /**
     * Set the current position
     * @param position Specifies the new position, will be copied using {@link Vec3.copy}
     */
    public setPosition(position: Vec3Like) {
        Vec3.copy(this.position, position);
        this.dirty = true;
    }

    public setForward(forward: Vec3Like): void {
        Vec3.copy(this.forward, forward);
        this.dirty = true;
    }

    /**
     * Return a new Transform with the same position, rotation, scaling, but no parent
     */
    public clone(): Component {
        return new Transform(this.position, this.rotation, this.scaling);
    }
}
