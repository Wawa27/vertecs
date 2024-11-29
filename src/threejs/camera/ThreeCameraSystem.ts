import { Camera, Quaternion, Vector3, WebGLRenderer } from "three";
import { quat, Vec3, vec3 } from "ts-gl-matrix";
// @ts-ignore
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Transform } from "../../math";
import { ThreeCamera } from "../index";
import { Entity, System } from "../../core";
import { SystemConstructor } from "../../core/EcsManager";

export default class ThreeCameraSystem extends System<
    [ThreeCamera, Transform]
> {
    #cameraEntity?: Entity;

    #renderer: WebGLRenderer;

    public constructor(
        renderer: WebGLRenderer,
        tps?: number,
        dependencies?: SystemConstructor<any>[]
    ) {
        super([ThreeCamera, Transform], tps, dependencies);
        this.#renderer = renderer;
    }

    public async onStart(): Promise<void> {
        this.#cameraEntity = this.ecsManager?.createEntity();
        const originEntity = this.ecsManager?.createEntity();
        originEntity?.addComponent(new Transform());
        this.cameraEntity?.addComponent(
            new ThreeCamera(new Camera(), originEntity)
        );
        this.cameraEntity?.addComponent(new Transform());
    }

    public onEntityEligible(
        entity: Entity,
        components: [ThreeCamera, Transform]
    ) {
        const cameraComponent = entity.getComponent(ThreeCamera);
        const transform = entity.getComponent(Transform);

        if (!cameraComponent || !transform) {
            throw new Error("Camera or transform component not found");
        }

        if (this.#cameraEntity) {
            this.#cameraEntity.removeComponent(ThreeCamera);
        }

        this.#cameraEntity = entity;
    }

    protected onLoop(
        components: [ThreeCamera, Transform][],
        entities: Entity[],
        deltaTime: number
    ): void {
        const cameraComponent = this.#cameraEntity?.getComponent(ThreeCamera);
        const camera = cameraComponent?.camera;
        const cameraTransform = this.#cameraEntity?.getComponent(Transform);

        const targetTransform =
            cameraComponent?.lookAt?.getComponent(Transform);

        if (!cameraComponent || !camera || !cameraTransform) {
            console.warn("Camera or transform not found");
            return;
        }

        const targetWorldPosition = targetTransform?.getWorldPosition();

        if (targetWorldPosition && targetTransform) {
            const targetWorldRotation = targetTransform.getWorldRotation();
            const targetWorldPosition = targetTransform.getWorldPosition();
            const cameraWorldPosition = cameraTransform.getWorldPosition();

            const currentOffset = vec3.sub(
                vec3.create(),
                cameraWorldPosition,
                targetWorldPosition
            );

            const targetOffset = vec3.transformQuat(
                vec3.create(),
                cameraComponent.lookAtOffset,
                targetWorldRotation
            );

            const currentWorldTargetOffset = vec3.lerp(
                vec3.create(),
                currentOffset,
                targetOffset,
                0.1
            );

            vec3.add(
                currentWorldTargetOffset,
                targetWorldPosition,
                currentWorldTargetOffset
            );
            cameraTransform.setWorldPosition(currentWorldTargetOffset);
            cameraTransform.targetTo(targetTransform.getWorldPosition());
        }

        const cameraWorldPosition = cameraTransform.getWorldPosition();
        const cameraWorldRotation = cameraTransform.getWorldRotation();

        camera.position.set(
            cameraWorldPosition[0],
            cameraWorldPosition[1],
            cameraWorldPosition[2]
        );
        camera.rotation.setFromQuaternion(
            new Quaternion(
                cameraWorldRotation[0],
                cameraWorldRotation[1],
                cameraWorldRotation[2],
                cameraWorldRotation[3]
            )
        );
    }

    public get cameraEntity(): Entity | undefined {
        return this.#cameraEntity;
    }

    public getForwardVector(): Vec3 {
        const cameraComponent = this.#cameraEntity?.getComponent(ThreeCamera);
        const camera = cameraComponent?.camera;

        if (!camera) {
            throw new Error("Camera not found");
        }

        const vector = new Vector3();
        camera.getWorldDirection(vector);

        return vec3.fromValues(vector.x, vector.y, vector.z);
    }
}
