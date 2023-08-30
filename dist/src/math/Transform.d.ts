/**
 * A transform represents a position, rotation and a scale, it may have a parent Transform,
 *
 * Global position, rotation and scale are only updated when dirty and queried,
 * parents are updated from the current transform up to the root transform.
 */
import { Mat4, Mat4Like, Quat, QuatLike, Vec3, Vec3Like } from "ts-gl-matrix";
import { Component, Entity } from "../core";
export default class Transform extends Component {
    #private;
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
    /**
     * Creates a new transform
     * @param translation Specifies the translation, will be copied using {@link Vec3.copy}
     * @param rotation Specifies the rotation, will be copied using {@link Quat.copy}
     * @param scaling Specifies the scale, will be copied using {@link Vec3.copy}
     * @param forward Specifies the forward vector, will be copied using {@link Vec3.copy}
     */
    constructor(translation?: Vec3Like, rotation?: QuatLike, scaling?: Vec3Like, forward?: Vec3);
    /**
     * Set this transform's parent to the entity's parent
     * @param entity The entity this transform is attached to
     */
    onAddedToEntity(entity: Entity): void;
    /**
     * Remove this transform's parent
     * @param entity The entity this transform was attached to
     */
    onRemovedFromEntity(entity: Entity): void;
    /**
     * Called whenever the attached entity parent change
     * @param parent The new parent entity
     */
    onEntityNewParent(parent: Entity): void;
    private setNewParent;
    onDestroyed(): void;
    static fromMat4(matrix: Mat4): Transform;
    /**
     * Copy the translation, rotation and scaling of the transform
     * @param transform The transform to copy from
     */
    copy(transform: Mat4): void;
    /**
     * Translate this transform using a translation vector
     * @param translation The translation vector
     */
    translate(translation: Vec3Like): void;
    setWorldRotation(rotation: QuatLike): void;
    /**
     * Reset the position, rotation, and scale to the default values
     */
    reset(): void;
    /**
     * Reset the rotation to the default values
     */
    resetRotation(): void;
    /**
     * Rotate this transform in the x axis
     * @param x An angle in radians
     */
    rotateX(x: number): void;
    /**
     * Rotate this transform in the y axis
     * @param y An angle in radians
     */
    rotateY(y: number): void;
    /**
     * Rotate this transform in the y axis
     * @param z An angle in radians
     */
    rotateZ(z: number): void;
    rotate(rotation: QuatLike): void;
    setWorldScale(scale: Vec3Like): void;
    scale(scale: Vec3Like): void;
    setScale(scale: Vec3Like): void;
    setRotationQuat(rotation: QuatLike): void;
    /**
     * Updates the model to world matrix of this transform and returns it
     * It update all the parents until no one is dirty
     */
    updateModelToWorldMatrix(): Mat4;
    getWorldToModelMatrix(): Mat4Like;
    getWorldPosition(): Vec3;
    /**
     * Get the world scale of this transform
     */
    getWorldScale(): Vec3;
    /**
     * Get the world rotation of this transform
     */
    getWorldRotation(): Quat;
    getWorldForwardVector(out: Vec3): Vec3;
    getVectorInModelSpace(out: Vec3, vector: Vec3Like): Vec3;
    getVectorInWorldSpace(out: Vec3, vector: Vec3): Vec3;
    toWorldScale(out: Vec3, scale: Vec3Like): Vec3;
    /**
     * Make this transform look at the specified position
     * @param x
     * @param y
     * @param z
     */
    lookAtXyz(x: number, y: number, z: number): void;
    lookAt(position: Vec3): void;
    setWorldUnitScale(): void;
    setWorldPosition(position: Vec3Like): void;
    /**
     * Set the current position
     * @param position Specifies the new position, will be copied using {@link Vec3.copy}
     */
    setPosition(position: Vec3Like): void;
    setForward(forward: Vec3Like): void;
    /**
     * Return a new Transform with the same position, rotation, scaling, but no parent
     */
    clone(): Component;
}
