import { ColorManagement, Matrix4, PCFSoftShadowMap, Quaternion, Scene, SRGBColorSpace, Vector3, WebGLRenderer, } from "three";
import { System } from "../core";
import ThreeObject3D from "./ThreeObject3D";
import { Transform } from "../math";
import ThreeCameraSystem from "./camera/ThreeCameraSystem";
import ThreeCamera from "./camera/ThreeCamera";
import ThreeLightSystem from "./light/ThreeLightSystem";
import ThreeCss3dSystem from "./css3d/ThreeCss3dSystem";
import ThreeInstancedMesh from "./ThreeInstancedMesh";
export default class ThreeSystem extends System {
    #scene;
    #renderer;
    #cameraSystem;
    #lightSystem;
    #css3dSystem;
    constructor(tps) {
        super([Transform, ThreeObject3D], tps);
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
    onAddedToEcsManager(ecsManager) {
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
    onEntityEligible(entity, components) {
        const threeMesh = entity.getComponent(ThreeObject3D);
        if (!threeMesh) {
            throw new Error("ThreeMesh not found on eligible entity");
        }
        if (threeMesh instanceof ThreeInstancedMesh) {
            const instancedMesh = threeMesh.object3D;
            for (let i = 0; i < instancedMesh.count; i++) {
                const matrix = new Matrix4();
                matrix.compose(new Vector3(0, 0, 0), new Quaternion(0, 0, 0, 1), new Vector3(0, 0, 0));
                instancedMesh.setMatrixAt(i, matrix);
                instancedMesh.instanceMatrix.needsUpdate = true;
            }
        }
        this.#scene.add(threeMesh?.object3D);
    }
    onEntityNoLongerEligible(entity, components) {
        const [transform, threeComponent] = components;
        if (threeComponent instanceof ThreeInstancedMesh) {
            const instancedMesh = threeComponent.object3D;
            const matrix = new Matrix4();
            matrix.compose(new Vector3(0, 0, 0), new Quaternion(0, 0, 0, 1), new Vector3(0, 0, 0));
            instancedMesh.setMatrixAt(threeComponent.entities.length + 1, matrix);
            instancedMesh.instanceMatrix.needsUpdate = true;
        }
        else {
            this.#scene.remove(threeComponent?.object3D);
        }
    }
    async onStart() { }
    onLoop(components, entities, deltaTime) {
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
                const object3d = threeMesh.object3D;
                const index = threeMesh.getEntityIndex(entities[i].id);
                object3d.getMatrixAt(index, matrix4);
                matrix4.makeRotationFromQuaternion(quaternion.set(qx, qy, qz, qw));
                matrix4.scale(scaleVector3.set(sx, sy, sz));
                matrix4.setPosition(x, y, z);
                object3d.setMatrixAt(index, matrix4);
                object3d.instanceMatrix.needsUpdate = true;
            }
            else {
                const { object3D } = threeMesh;
                object3D.position.set(x, y, z);
                object3D.quaternion.set(qx, qy, qz, qw);
                object3D.scale.set(sx, sy, sz);
                object3D.updateMatrix();
            }
        }
        this.#renderer.render(this.#scene, this.#cameraSystem.cameraEntity.getComponent(ThreeCamera).camera);
    }
    get camera() {
        return this.#cameraSystem.cameraEntity.getComponent(ThreeCamera)
            .camera;
    }
    get renderer() {
        return this.#renderer;
    }
    get scene() {
        return this.#scene;
    }
}
