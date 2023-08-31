import {
    AmbientLight,
    BoxGeometry,
    GridHelper,
    Mesh,
    MeshBasicMaterial,
    MeshStandardMaterial,
    PerspectiveCamera,
    PointLight,
    SphereGeometry,
} from "three";
import {
    EcsManager,
    Entity,
    OimoComponent,
    OimoSystem,
    System,
    ThreeCamera,
    ThreeLightComponent,
    ThreeObject3D,
    ThreeSystem,
    Transform,
} from "../../src";

const ecsManager = new EcsManager();

export const spawnCube = (
    position: [number, number, number],
    scale: [number, number, number],
    rotation: [number, number, number]
) => {
    const cube = ecsManager.createEntity({ name: "cube" });
    cube.addComponent(new Transform(position, undefined, undefined));
    cube.addComponent(
        new ThreeObject3D(
            new Mesh(
                new BoxGeometry(scale[0], scale[1], scale[2]),
                new MeshStandardMaterial({ color: 0x808080 })
            )
        )
    );
    cube.addComponent(
        new OimoComponent({
            type: "box",
            move: true,
            density: 1,
            size: scale,
        })
    );
};

export const spawnSphere = (
    position: [number, number, number],
    radius: number
) => {
    const sphere = ecsManager.createEntity();
    sphere.addComponent(new Transform(position, undefined, undefined));
    sphere.addComponent(
        new ThreeObject3D(
            new Mesh(
                new SphereGeometry(radius, 64, 64),
                new MeshStandardMaterial({ color: 0x808080 })
            )
        )
    );
    sphere.addComponent(
        new OimoComponent({
            type: "sphere",
            move: true,
            density: 1,
            size: [radius],
        })
    );
};

export const initializeBoilerplate = async (): Promise<EcsManager> => {
    const threeSystem = new ThreeSystem();
    await ecsManager.addSystem(threeSystem);
    await ecsManager.addSystem(new OimoSystem());

    const gridHelper = new GridHelper(75, 20);
    threeSystem.scene.add(gridHelper);

    const floor = ecsManager.createEntity({ name: "floor" });
    floor.addComponent(new Transform([0, -5, 0]));
    floor.addComponent(
        new OimoComponent({
            size: [50, 10, 50],
            density: 1,
            move: false,
        })
    );

    const camera = ecsManager.createEntity();
    camera.addComponent(new Transform([0, 0, 20]));
    const threeCameraComponent = new ThreeCamera(
        new PerspectiveCamera(
            90,
            window.innerWidth / window.innerHeight,
            1,
            200
        ),
        floor,
        undefined,
        undefined,
        false
    );
    camera.addComponent(threeCameraComponent);

    const light = ecsManager.createEntity();
    light.addComponent(new Transform([0, 100, 100]));
    light.addComponent(
        new ThreeObject3D(
            new Mesh(
                new SphereGeometry(0.1, 64, 64),
                new MeshBasicMaterial({ color: 0xffffff })
            )
        )
    );
    light.addComponent(new ThreeLightComponent(new PointLight(0xffffff, 1)));

    class RespawnSystem extends System<[OimoComponent]> {
        public constructor() {
            super([OimoComponent]);
        }

        protected onLoop(
            components: [OimoComponent][],
            entities: Entity[],
            deltaTime: number
        ): void {
            for (let i = 0; i < components.length; i++) {
                const [oimoComponent] = components[i];
                if (oimoComponent.body && oimoComponent.body.position.y < -10) {
                    oimoComponent.body?.resetPosition(
                        Math.random() * 10 - 5,
                        30,
                        Math.random() * 10 - 5
                    );
                }
            }
        }
    }

    const ambientLight = ecsManager.createEntity();
    ambientLight.addComponent(
        new ThreeLightComponent(new AmbientLight(0xffffff, 0.2))
    );

    await ecsManager.addSystem(new RespawnSystem());

    await ecsManager.start();

    return ecsManager;
};
