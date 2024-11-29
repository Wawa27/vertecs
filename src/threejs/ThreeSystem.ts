import {
    ACESFilmicToneMapping,
    Camera,
    ColorManagement,
    Fog,
    InstancedMesh,
    Matrix4,
    PCFSoftShadowMap,
    Quaternion,
    Scene,
    SRGBColorSpace,
    Vector3,
    WebGLRenderer,
} from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { EcsManager, Entity, System } from "../core";
import ThreeObject3D from "./ThreeObject3D";
import { Transform } from "../math";
import ThreeCameraSystem from "./camera/ThreeCameraSystem";
import ThreeCamera from "./camera/ThreeCamera";
import ThreeLightSystem from "./light/ThreeLightSystem";
import ThreeCss3dSystem from "./css3d/ThreeCss3dSystem";
import ThreeInstancedMesh from "./ThreeInstancedMesh";
import { SystemConstructor } from "../core/EcsManager";

export default class ThreeSystem extends System<[Transform, ThreeObject3D]> {
    #scene: Scene;

    #renderer: WebGLRenderer;

    #cameraSystem?: ThreeCameraSystem;

    #lightSystem?: ThreeLightSystem;

    #css3dSystem?: ThreeCss3dSystem;

    #stats?: Stats;

    public constructor(tps?: number, dependencies?: SystemConstructor<any>[]) {
        super([Transform, ThreeObject3D], tps, dependencies);
        this.#scene = new Scene();

        const canvas = document.getElementById("canvas");

        if (!canvas) {
            throw new Error("Canvas not found");
        }

        this.#renderer = new WebGLRenderer({ antialias: true, canvas });
        this.#renderer.setPixelRatio(window.devicePixelRatio);
        this.#renderer.setSize(window.innerWidth, window.innerHeight);
        this.#renderer.setClearColor(0x323336);
        this.#renderer.shadowMap.enabled = true;
        this.#renderer.shadowMap.type = PCFSoftShadowMap;
        this.#renderer.domElement.id = "game";

        ColorManagement.enabled = true;

        this.#renderer.outputColorSpace = SRGBColorSpace;

        document.body.appendChild(this.#renderer.domElement);
    }

    public onAddedToEcsManager(ecsManager: EcsManager) {
        this.#lightSystem = new ThreeLightSystem(
            this.#scene,
            this.tps,
            this.$dependencies
        );
        ecsManager.addSystem(this.#lightSystem);

        if (!this.#cameraSystem) {
            this.#cameraSystem = new ThreeCameraSystem(this.renderer, this.tps);
        }
        ecsManager.addSystem(this.#cameraSystem);

        this.$dependencies = [
            ...this.$dependencies,
            ThreeCameraSystem,
            ThreeLightSystem,
        ];

        if (document.getElementById("hud")) {
            this.#css3dSystem = new ThreeCss3dSystem(this, this.tps);
            ecsManager.addSystem(this.#css3dSystem);
        }

        this.#renderer.toneMapping = ACESFilmicToneMapping;
    }

    public addFog(fog: Fog) {
        this.#scene.fog = fog;
        this.#renderer.setClearColor(this.#scene.fog.color);
    }

    public enableStats() {
        this.#stats = new Stats();
        document.body.appendChild(this.#stats.dom);
    }

    public disableStats() {
        document.body.removeChild(this.#stats?.dom!);
        this.#stats = undefined;
    }

    public onEntityEligible(
        entity: Entity,
        components: [Transform, ThreeObject3D]
    ) {
        const threeMesh = entity.getComponent(ThreeObject3D);

        if (!threeMesh) {
            throw new Error("ThreeMesh not found on eligible entity");
        }

        if (threeMesh instanceof ThreeInstancedMesh) {
            const instancedMesh = threeMesh.object3D as InstancedMesh;

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

        this.#scene.add(threeMesh?.object3D);
    }

    public onEntityNoLongerEligible(
        entity: Entity,
        components: [Transform, ThreeObject3D]
    ) {
        const [transform, threeComponent] = components;

        if (threeComponent instanceof ThreeInstancedMesh) {
            const instancedMesh = threeComponent.object3D as InstancedMesh;
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
            this.#scene.remove(threeComponent?.object3D);
        }
    }

    public async onStart(): Promise<void> {}

    protected onLoop(
        components: [Transform, ThreeObject3D][],
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
                const object3d = threeMesh.object3D as InstancedMesh;
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
                const { object3D } = threeMesh;

                object3D.position.set(x, y, z);
                object3D.quaternion.set(qx, qy, qz, qw);
                object3D.scale.set(sx, sy, sz);

                object3D.updateMatrix();
            }
        }

        this.#renderer.render(this.#scene, this.getCamera());

        this.#stats?.update();
    }

    public getCamera(): Camera {
        return this.#cameraSystem!.cameraEntity!.getComponent(ThreeCamera)!
            .camera;
    }

    public get renderer(): WebGLRenderer {
        return this.#renderer;
    }

    public get scene(): Scene {
        return this.#scene;
    }
}
