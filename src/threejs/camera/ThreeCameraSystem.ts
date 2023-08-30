import { Camera, Quaternion, WebGLRenderer } from "three";
import { vec3 } from "ts-gl-matrix";
// @ts-ignore
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Transform } from "../../math";
import { ThreeCamera } from "../index";
import { Component, Entity, System } from "../../core";
import ThreeSystem from "../ThreeSystem";

export default class ThreeCameraSystem extends System<
    [ThreeCamera, Transform]
> {
    #cameraEntity?: Entity;

    #renderer: WebGLRenderer;

    #controls?: OrbitControls;

    public constructor(renderer: WebGLRenderer, tps?: number) {
        super([ThreeCamera, Transform], tps);
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

        if (cameraComponent.orbitControls) {
            this.#controls = new OrbitControls(
                cameraComponent.camera,
                this.#renderer.domElement
            );
        }

        const lookAtWorldPosition = cameraComponent.lookAt
            ?.getComponent(Transform)
            ?.getWorldPosition();

        const worldPosition = transform.getWorldPosition();

        cameraComponent.camera.position.set(
            worldPosition[0],
            worldPosition[1],
            worldPosition[2]
        );

        if (lookAtWorldPosition) {
            cameraComponent.camera.lookAt(
                lookAtWorldPosition[0],
                lookAtWorldPosition[1],
                lookAtWorldPosition[2]
            );
        }

        this.#controls?.update();
    }

    protected onLoop(
        components: [ThreeCamera, Transform][],
        entities: Entity[],
        deltaTime: number
    ): void {
        const cameraComponent = this.#cameraEntity?.getComponent(ThreeCamera);
        const camera = cameraComponent?.camera;
        const transform = this.#cameraEntity?.getComponent(Transform);
        const lookAtTransform =
            cameraComponent?.lookAt?.getComponent(Transform);

        if (!cameraComponent || !camera || !transform) {
            console.warn("Camera or transform not found");
            return;
        }

        if (cameraComponent.orbitControls) {
            this.#controls?.update();
            return;
        }

        const worldPosition = transform.getWorldPosition();
        const worldRotation = transform.getWorldRotation();

        camera.position.set(
            worldPosition[0],
            worldPosition[1],
            worldPosition[2]
        );
        camera.rotation.setFromQuaternion(
            new Quaternion(
                worldRotation[0],
                worldRotation[1],
                worldRotation[2],
                worldRotation[3]
            )
        );

        if (lookAtTransform) {
            const worldPosition = lookAtTransform.getWorldPosition();
            camera.position.set(
                worldPosition[0] + cameraComponent.lookAtOffset[0],
                worldPosition[1] + cameraComponent.lookAtOffset[1],
                worldPosition[2] + cameraComponent.lookAtOffset[2]
            );

            const lookAtWorldPosition = lookAtTransform?.getWorldPosition();

            if (lookAtWorldPosition) {
                camera.lookAt(
                    lookAtWorldPosition[0],
                    lookAtWorldPosition[1],
                    lookAtWorldPosition[2]
                );
            }
        }
    }

    public get cameraEntity(): Entity | undefined {
        return this.#cameraEntity;
    }
}
