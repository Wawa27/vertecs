import { BoxGeometry, Mesh, MeshBasicMaterial, PerspectiveCamera } from "three";
import { EcsManager, ThreeCamera, Transform } from "../../src";
import ThreeSystem from "../../src/threejs/ThreeSystem";
import ThreeObject3D from "../../src/threejs/ThreeObject3D";

const ecsManager = new EcsManager();

await ecsManager.addSystem(new ThreeSystem());

const cube = ecsManager.createEntity({ name: "cube" });
cube.addComponent(new Transform([0, 0, 0]));
cube.addComponent(
    new ThreeObject3D(
        new Mesh(
            new BoxGeometry(1, 1, 1),
            new MeshBasicMaterial({ color: 0x00ff00 })
        )
    )
);

const camera = ecsManager.createEntity({ name: "camera" });
camera.addComponent(new Transform([0, 0, 2]));
camera.addComponent(
    new ThreeCamera(
        new PerspectiveCamera(
            90,
            window.innerWidth / window.innerHeight,
            1,
            1000
        ),
        undefined,
        undefined,
        undefined,
        true
    )
);

await ecsManager.start();
