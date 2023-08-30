import { BoxGeometry, Mesh, MeshStandardMaterial, PerspectiveCamera, PointLight, } from "three";
import { quat } from "ts-gl-matrix";
import { OimoComponent, ThreeCamera, ThreeLightComponent, ThreeObject3D, Transform, } from "../../src";
import { initializeBoilerplate, spawnSphere } from "./Boilerplate";
const ecsManager = await initializeBoilerplate();
const platform1 = ecsManager.createEntity({ name: "platform1" });
platform1.addComponent(new Transform([0, -5, 12], quat.fromEuler(quat.create(), 0, 0, -1)));
platform1.addComponent(new OimoComponent({
    size: [50, 10, 20],
    density: 1,
    restitution: 0.4,
}));
platform1.addComponent(new ThreeObject3D(new Mesh(new BoxGeometry(50, 10, 20), new MeshStandardMaterial({ color: 0x6fbbd3 }))));
const platform2 = ecsManager.createEntity({ name: "platform2" });
platform2.addComponent(new Transform([0, -5, -12], quat.fromEuler(quat.create(), 0, 0, 1)));
platform2.addComponent(new OimoComponent({
    size: [50, 10, 20],
    density: 1,
    restitution: 0.6,
}));
platform2.addComponent(new ThreeObject3D(new Mesh(new BoxGeometry(50, 10, 20), new MeshStandardMaterial({ color: 0x6fbbd3 }))));
spawnSphere([0, 60, 12], 2);
spawnSphere([0, 20, -12], 2);
const camera = ecsManager.createEntity({ name: "camera" });
camera.addComponent(new Transform([90, 20, 0]));
const threeCameraComponent = new ThreeCamera(new PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 200), ecsManager.createEntity(), undefined, undefined, true);
camera.addComponent(threeCameraComponent);
const light = ecsManager.createEntity();
light.addComponent(new Transform([0, 50, 0]));
light.addComponent(new ThreeLightComponent(new PointLight(0xffffff, 1, 100, 0)));
await ecsManager.start();
