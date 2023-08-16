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
import { Component, EcsManager, Entity, System } from "../core";
import ThreeMesh from "./ThreeMesh";
import { Transform } from "../math";
import ThreeCameraSystem from "./camera/ThreeCameraSystem";
import ThreeCameraComponent from "./camera/ThreeCameraComponent";
import ThreeLightSystem from "./light/ThreeLightSystem";
import ThreeCss3dSystem from "./css3d/ThreeCss3dSystem";
import ThreeInstancedMesh from "./ThreeInstancedMesh";

export default class ThreeSystem extends System<[Transform, ThreeMesh]> {
    #scene: Scene;

    #renderer: WebGLRenderer;

    #cameraSystem?: ThreeCameraSystem;

    #lightSystem?: ThreeLightSystem;

    #css3dSystem?: ThreeCss3dSystem;

    public constructor(tps?: number) {
        super([Transform, ThreeMesh], tps);
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
        this.#lightSystem = new ThreeLightSystem(this.#scene, this.tps);
        ecsManager.addSystem(this.#lightSystem);

        this.#cameraSystem = new ThreeCameraSystem(this.renderer, this.tps);
        ecsManager.addSystem(this.#cameraSystem);

        this.$dependencies = [ThreeCameraSystem, ThreeLightSystem];

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

    protected onLoop(
        components: [Transform, ThreeMesh][],
        entities: Entity[],
        deltaTime: number
    ): void {
        const positionVector3 = new Vector3();
        const quaternion = new Quaternion();
        const scaleVector3 = new Vector3();

        const matrix4 = new Matrix4();

        for (let i = 0; i < components.length; i++) {
            const [transform, threeMesh] = components[i];

            // TODO: Check how to ignore entities that have a camera
            const [x, y, z] = transform.getWorldPosition();
            const [qx, qy, qz, qw] = transform.getWorldRotation();
            const [sx, sy, sz] = transform.getWorldScale();

            if (threeMesh instanceof ThreeInstancedMesh) {
                const object3d = threeMesh.object3d as InstancedMesh;
                const index = threeMesh.getEntityIndex(entities[i].id);

                object3d.getMatrixAt(index, matrix4);

                matrix4.makeRotationFromQuaternion(
                    quaternion.set(qx, qy, qz, qw)
                );
                matrix4.scale(scaleVector3.set(sx, sy, sz));
                matrix4.setPosition(x, y, z);

                object3d.setMatrixAt(index, matrix4);
                object3d.instanceMatrix.needsUpdate = true;
            } else {
                const { object3d } = threeMesh;

                object3d.position.set(x, y, z);
                object3d.quaternion.set(qx, qy, qz, qw);
                object3d.scale.set(sx, sy, sz);

                object3d.updateMatrix();
            }
        }

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
