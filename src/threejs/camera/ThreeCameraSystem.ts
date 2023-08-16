import { Camera, WebGLRenderer } from "three";
import { vec3 } from "ts-gl-matrix";
// @ts-ignore
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Transform } from "../../math";
import { ThreeCameraComponent } from "../index";
import { Component, Entity, System } from "../../core";
import ThreeSystem from "../ThreeSystem";

export default class ThreeCameraSystem extends System<
    [ThreeCameraComponent, Transform]
> {
    #cameraEntity?: Entity;

    #renderer: WebGLRenderer;

    #controls?: OrbitControls;

    public constructor(renderer: WebGLRenderer, tps?: number) {
        super([ThreeCameraComponent, Transform], tps);
        this.#renderer = renderer;
    }

    public async onStart(): Promise<void> {
        this.#cameraEntity = this.ecsManager?.createEntity();
        const originEntity = this.ecsManager?.createEntity();
        originEntity?.addComponent(new Transform());
        this.cameraEntity?.addComponent(
            new ThreeCameraComponent(new Camera(), originEntity)
        );
        this.cameraEntity?.addComponent(new Transform());
    }

    public onEntityEligible(
        entity: Entity,
        lastComponentAdded: Component | undefined
    ) {
        const cameraComponent = entity.getComponent(ThreeCameraComponent);
        const transform = entity.getComponent(Transform);

        if (!cameraComponent || !transform) {
            throw new Error("Camera or transform component not found");
        }

        if (this.#cameraEntity) {
            this.#cameraEntity.removeComponent(ThreeCameraComponent);
        }

        this.#cameraEntity = entity;

        if (cameraComponent.orbitControls) {
            this.#controls = new OrbitControls(
                cameraComponent.camera,
                this.#renderer.domElement
            );
        }

        const lookAtWorldPosition =
            cameraComponent.lookAt?.getComponent(Transform)?.position;

        const worldPosition = transform.position;

        if (lookAtWorldPosition) {
            vec3.add(worldPosition, worldPosition, lookAtWorldPosition);
            vec3.add(worldPosition, worldPosition, [0, 1, 2]);
        }

        cameraComponent.camera.position.set(
            worldPosition[0],
            worldPosition[1],
            worldPosition[2]
        );

        this.#controls?.update();
    }

    protected onLoop(
        components: [ThreeCameraComponent, Transform][],
        entities: Entity[],
        deltaTime: number
    ): void {
        const cameraComponent =
            this.#cameraEntity?.getComponent(ThreeCameraComponent);
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

        camera.position.set(
            worldPosition[0],
            worldPosition[1],
            worldPosition[2]
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
