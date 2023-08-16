import {
    BoxGeometry,
    Mesh,
    MeshStandardMaterial,
    PerspectiveCamera,
    PointLight,
    SphereGeometry,
} from "three";
import { quat } from "ts-gl-matrix";
import {
    OimoComponent,
    OimoSystem,
    ThreeCameraComponent,
    ThreeLightComponent,
    ThreeMesh,
    Transform,
} from "../../src";
import { initializeBoilerplate } from "./Boilerplate";

const ecsManager = await initializeBoilerplate();

const floor = ecsManager.createEntity();
floor.addComponent(new Transform([0, -5, 0]));
floor.addComponent(
    new ThreeMesh(
        new Mesh(
            new BoxGeometry(50, 10, 50),
            new MeshStandardMaterial({ color: 0x808080 })
        )
    )
);
floor.addComponent(
    new OimoComponent({
        size: [50, 10, 50],
        density: 1,
        restitution: 0.5,
    })
);

const camera = ecsManager.createEntity({ name: "camera" });
camera.addComponent(new Transform([40, 20, 0]));
const threeCameraComponent = new ThreeCameraComponent(
    new PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 200),
    ecsManager.createEntity(),
    undefined,
    undefined,
    true
);
camera.addComponent(threeCameraComponent);

const light = ecsManager.createEntity();
light.addComponent(new Transform([0, 50, 0]));
light.addComponent(
    new ThreeLightComponent(new PointLight(0xffffff, 1, 200, 0))
);

const addTower = (towerOptions: {
    radius: number;
    detail: number;
    mass: number;
    brickThickness?: number;
    brickHeight?: number;
    towerHeight: number;
    position: [number, number, number];
}) => {
    if (towerOptions.radius > 45) return;

    const detail = towerOptions.detail ?? 10;
    const mass = towerOptions.mass ?? 1;

    let px;
    let py;
    let pz;
    let angle;
    let rad;
    const radius = towerOptions.radius ?? 1;
    const height = towerOptions.towerHeight ?? 1;
    const sx = towerOptions.brickThickness ?? 1;
    const sy = towerOptions.brickHeight ?? 1;
    const sz = (radius * 5) / detail;

    for (let j = 0; j < height; j++) {
        for (let i = 0; i < detail; i++) {
            rad = radius;
            // eslint-disable-next-line no-bitwise
            angle = ((Math.PI * 2) / detail) * (i + (j & 1) * 0.5);
            px = towerOptions.position[0] + Math.cos(angle) * rad;
            py = towerOptions.position[1] + sy + j * sy - sy * 0.5;
            pz = towerOptions.position[2] - Math.sin(angle) * rad;

            const brick = ecsManager.createEntity();
            brick.addComponent(
                new Transform(
                    [px, py, pz],
                    quat.fromEuler(quat.create(), 0, angle * (180 / Math.PI), 0)
                )
            );
            brick.addComponent(
                new ThreeMesh(
                    new Mesh(
                        new BoxGeometry(sx, sy, sz),
                        new MeshStandardMaterial({ color: 0x808080 })
                    )
                )
            );
            brick.addComponent(
                new OimoComponent({
                    type: "box",
                    move: true,
                    size: [sx, sy, sz],
                    density: mass,
                    restitution: 0.1,
                })
            );
        }
    }
};

addTower({
    radius: 9,
    towerHeight: 20,
    detail: 15,
    mass: 0.4,
    position: [5, 0, 5],
});

const platform = ecsManager.createEntity();
platform.addComponent(
    new Transform([-30, 10, 0], quat.fromEuler(quat.create(), 0, 0, 60))
);
platform.addComponent(
    new ThreeMesh(
        new Mesh(
            new BoxGeometry(2, 40, 50),
            new MeshStandardMaterial({ color: 0x808080 })
        )
    )
);
platform.addComponent(
    new OimoComponent({
        size: [2, 40, 50],
        density: 1,
        restitution: 0.2,
    })
);

const ball = ecsManager.createEntity();
ball.addComponent(new Transform([-45, 25, 0]));
ball.addComponent(
    new ThreeMesh(
        new Mesh(
            new SphereGeometry(2, 64, 64),
            new MeshStandardMaterial({ color: 0x808080 })
        )
    )
);
ball.addComponent(
    new OimoComponent({
        type: "sphere",
        move: true,
        size: [2, 2, 2],
        density: 0.6,
    })
);

await ecsManager.addSystem(new OimoSystem());

await ecsManager.start();
