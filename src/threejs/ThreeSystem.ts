import {
    Camera,
    ColorManagement,
    InstancedMesh,
    Matrix4,
    PCFSoftShadowMap,
    Quaternion,
    Scene,
    SRGBColorSpace,
    Vector3,
    WebGLRenderer,
} from "three";
import { quat, vec3 } from "gl-matrix";
import { Component, EcsManager, Entity, System } from "../core";
import ThreeMesh from "./ThreeMesh";
import { Transform } from "../math";
import ThreeCameraSystem from "./camera/ThreeCameraSystem";
import ThreeCameraComponent from "./camera/ThreeCameraComponent";
import ThreeLightSystem from "./light/ThreeLightSystem";
import ThreeCss3dSystem from "./css3d/ThreeCss3dSystem";
import ThreeInstancedMesh from "./ThreeInstancedMesh";

export default class ThreeSystem extends System {
    #scene: Scene;

    #renderer: WebGLRenderer;

    #cameraSystem?: ThreeCameraSystem;

    #lightSystem?: ThreeLightSystem;

    #css3dSystem?: ThreeCss3dSystem;

    public constructor(tps?: number) {
        super([ThreeMesh], tps);
        this.#scene = new Scene();

        this.#renderer = new WebGLRenderer({ antialias: true });
        this.#renderer.setPixelRatio(window.devicePixelRatio);
        this.#renderer.setSize(window.innerWidth, window.innerHeight);
        this.#renderer.setClearColor(0x323336);
        this.#renderer.shadowMap.enabled = true;
        this.#renderer.shadowMap.type = PCFSoftShadowMap;

        ColorManagement.enabled = true;

        this.#renderer.outputColorSpace = SRGBColorSpace;

        document.body.appendChild(this.#renderer.domElement);
    }

    public onAddedToEcsManager(ecsManager: EcsManager) {
        this.#lightSystem = new ThreeLightSystem(this.#scene);
        ecsManager.addSystem(this.#lightSystem);

        this.#cameraSystem = new ThreeCameraSystem(this.renderer);
        ecsManager.addSystem(this.#cameraSystem);

        if (document.getElementById("hud")) {
            this.#css3dSystem = new ThreeCss3dSystem(this, this.tps);
            ecsManager.addSystem(this.#css3dSystem);
        }
    }

    public onEntityEligible(
        entity: Entity,
        lastComponentAdded: Component | undefined
    ) {
        const threeMesh = entity.getComponent(ThreeMesh);

        if (!threeMesh) {
            throw new Error("ThreeMesh not found on eligible entity");
        }

        if (threeMesh instanceof ThreeInstancedMesh) {
            const instancedMesh = threeMesh.object3d as InstancedMesh;

            for (let i = 0; i < instancedMesh.count; i++) {
                const matrix = new Matrix4();
                matrix.compose(
                    new Vector3(0, 0, 0),
                    new Quaternion(0, 0, 0, 1),
                    new Vector3(0, 0, 0)
                );
                instancedMesh.setMatrixAt(i, matrix);
                instancedMesh.instanceMatrix.needsUpdate = true;
            }
        }

        this.#scene.add(threeMesh?.object3d);
    }

    public onEntityNoLongerEligible(
        entity: Entity,
        lastComponentRemoved: Component
    ) {
        const threeComponent =
            entity.getComponent(ThreeMesh) ??
            (lastComponentRemoved as ThreeMesh | ThreeInstancedMesh);

        if (threeComponent instanceof ThreeInstancedMesh) {
            const instancedMesh = threeComponent.object3d as InstancedMesh;
            const matrix = new Matrix4();
            matrix.compose(
                new Vector3(0, 0, 0),
                new Quaternion(0, 0, 0, 1),
                new Vector3(0, 0, 0)
            );
            instancedMesh.setMatrixAt(
                threeComponent.entities.length + 1,
                matrix
            );
            instancedMesh.instanceMatrix.needsUpdate = true;
        } else {
            this.#scene.remove(threeComponent?.object3d);
        }
    }

    public async onStart(): Promise<void> {}

    protected onLoop(entities: Entity[], deltaTime: number): void {
        entities.forEach((entity) => {
            const transform = entity.getComponent(Transform);
            const threeMesh = entity.getComponent(ThreeMesh);
            const cameraComponent = entity.getComponent(ThreeCameraComponent);

            if (transform && threeMesh && !cameraComponent) {
                const rotation = transform.getWorldRotation(quat.create());
                const worldPosition = transform.getWorldPosition(vec3.create());
                const worldScale = transform.getWorldScale(vec3.create());

                if (threeMesh instanceof ThreeInstancedMesh) {
                    const object3d = threeMesh.object3d as InstancedMesh;
                    const index = threeMesh.getEntityIndex(entity.id);

                    const matrix = new Matrix4();
                    object3d.getMatrixAt(index, matrix);
                    matrix.compose(
                        new Vector3(
                            worldPosition[0],
                            worldPosition[1],
                            worldPosition[2]
                        ),
                        new Quaternion(
                            rotation[0],
                            rotation[1],
                            rotation[2],
                            rotation[3]
                        ),
                        new Vector3(worldScale[0], worldScale[1], worldScale[2])
                    );
                    object3d.setMatrixAt(index, matrix);
                    object3d.instanceMatrix.needsUpdate = true;
                } else {
                    const { object3d } = threeMesh;

                    object3d.position.set(
                        worldPosition[0],
                        worldPosition[1],
                        worldPosition[2]
                    );
                    object3d.rotation.setFromQuaternion(
                        new Quaternion(
                            rotation[0],
                            rotation[1],
                            rotation[2],
                            rotation[3]
                        )
                    );
                    object3d.scale.set(
                        worldScale[0],
                        worldScale[1],
                        worldScale[2]
                    );
                    object3d.updateMatrix();
                }
            }
        });

        this.#renderer.render(
            this.#scene,
            this.#cameraSystem!.cameraEntity!.getComponent(
                ThreeCameraComponent
            )!.camera
        );
    }

    public get camera(): Camera {
        return this.#cameraSystem!.cameraEntity!.getComponent(
            ThreeCameraComponent
        )!.camera;
    }

    public get renderer(): WebGLRenderer {
        return this.#renderer;
    }

    public get scene(): Scene {
        return this.#scene;
    }
}
