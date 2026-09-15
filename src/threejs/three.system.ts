import {
    ACESFilmicToneMapping,
    Camera,
    ColorManagement,
    Fog,
    FogExp2,
    InstancedMesh,
    Matrix4,
    PCFSoftShadowMap,
    Quaternion,
    Scene,
    SRGBColorSpace,
    Vector3,
    WebGLRenderer,
} from "three";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { EcsManager, Entity, System } from "../core";
import ThreeObject3DComponent from "./three-object3D.component";
import { Transform } from "../math";
import ThreeCameraSystem from "./camera/ThreeCameraSystem";
import ThreeCamera from "./camera/ThreeCamera";
import ThreeLightSystem from "./light/ThreeLightSystem";
import ThreeCss3dSystem from "./css3d/ThreeCss3dSystem";
import ThreeInstancedMeshComponent from "./three-instanced-mesh.component";
import { SystemConstructor } from "../core/EcsManager";

export interface RendererComposer {
    render(): void;
    setSize(width: number, height: number): void;
    dispose(): void;
}

export default class ThreeSystem extends System<
    [Transform, ThreeObject3DComponent]
> {
    #scene: Scene;

    #renderer: WebGLRenderer;

    #cameraSystem?: ThreeCameraSystem;

    #lightSystem?: ThreeLightSystem;

    #css3dSystem?: ThreeCss3dSystem;

    #stats?: Stats;

    #composer?: RendererComposer;

    public constructor(tps?: number, dependencies?: SystemConstructor<any>[]) {
        super([Transform, ThreeObject3DComponent], tps, dependencies);
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

    public addFog(fog: Fog | FogExp2) {
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
        components: [Transform, ThreeObject3DComponent]
    ) {
        const threeMesh = entity.getComponent(ThreeObject3DComponent);

        if (!threeMesh) {
            throw new Error("ThreeMesh not found on eligible entity");
        }

        this.#scene.add(threeMesh?.object3D);
    }

    public onEntityNoLongerEligible(
        entity: Entity,
        components: [Transform, ThreeObject3DComponent]
    ) {
        const [, threeComponent] = components;

        this.#scene.remove(threeComponent?.object3D);
    }

    public async onStart(): Promise<void> {}

    protected onLoop(
        components: [Transform, ThreeObject3DComponent][],
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

            if (threeMesh instanceof ThreeInstancedMeshComponent) {
                for (
                    let instanceIndex = 0;
                    instanceIndex < threeMesh.instances.length;
                    instanceIndex++
                ) {
                    const object3d = threeMesh.object3D as InstancedMesh;
                    const instance = threeMesh.getInstance(instanceIndex);

                    if (instance.isDirty) {
                        const [ix, iy, iz] =
                            instance.transform.getWorldPosition();
                        const [iqx, iqy, iqz, iqw] =
                            instance.transform.getWorldRotation();
                        const [isx, isy, isz] =
                            instance.transform.getWorldScale();

                        matrix4.compose(
                            positionVector3.set(ix, iy, iz),
                            quaternion.set(iqx, iqy, iqz, iqw),
                            scaleVector3.set(isx, isy, isz)
                        );

                        object3d.setMatrixAt(instanceIndex, matrix4);
                        object3d.instanceMatrix.needsUpdate = true;
                        threeMesh.unmarkInstanceAsDirty(instanceIndex);
                    }
                }
            } else {
                const { object3D } = threeMesh;

                object3D.position.set(x, y, z);
                object3D.quaternion.set(qx, qy, qz, qw);
                object3D.scale.set(sx, sy, sz);

                object3D.updateMatrix();
            }
        }

        if (this.#composer) {
            this.#composer.render();
        } else {
            this.#renderer.render(this.#scene, this.getCamera());
        }

        this.#stats?.update();
    }

    public setComposer(composer: RendererComposer | undefined): void {
        this.#composer = composer;
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
