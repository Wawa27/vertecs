import {
    AmbientLight,
    BoxGeometry,
    GridHelper,
    Euler,
    Quaternion,
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
    RapierComponent,
    RapierSystem,
    System,
    ThreeCamera,
    ThreeLightComponent,
    ThreeObject3DComponent,
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
    cube.addComponent(
        new Transform(
            position,
            new Quaternion()
                .setFromEuler(
                    new Euler(
                        ...(rotation.map(
                            (angle) => (angle * Math.PI) / 180
                        ) as [number, number, number])
                    )
                )
                .toArray()
        )
    );
    cube.addComponent(
        new ThreeObject3DComponent(
            new Mesh(
                new BoxGeometry(scale[0], scale[1], scale[2]),
                new MeshStandardMaterial({ color: 0x808080 })
            )
        )
    );
    cube.addComponent(
        new RapierComponent({
            type: "box",
            bodyType: "dynamic",
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
        new ThreeObject3DComponent(
            new Mesh(
                new SphereGeometry(radius, 64, 64),
                new MeshStandardMaterial({ color: 0x808080 })
            )
        )
    );
    sphere.addComponent(
        new RapierComponent({
            type: "sphere",
            bodyType: "dynamic",
            density: 1,
            size: [radius],
        })
    );
};

export const initializeBoilerplate = async (): Promise<EcsManager> => {
    const threeSystem = new ThreeSystem();
    threeSystem.$dependencies.push(RapierSystem);
    await ecsManager.addSystem(threeSystem);
    await ecsManager.addSystem(new RapierSystem());

    const gridHelper = new GridHelper(75, 20);
    threeSystem.scene.add(gridHelper);

    const floor = ecsManager.createEntity({ name: "floor" });
    floor.addComponent(new Transform([0, -5, 0]));
    floor.addComponent(
        new RapierComponent({
            type: "box",
            size: [50, 10, 50],
            density: 1,
            bodyType: "fixed",
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
        new ThreeObject3DComponent(
            new Mesh(
                new SphereGeometry(0.1, 64, 64),
                new MeshBasicMaterial({ color: 0xffffff })
            )
        )
    );
    light.addComponent(new ThreeLightComponent(new PointLight(0xffffff, 1)));

    class RespawnSystem extends System<[RapierComponent]> {
        public constructor() {
            super([RapierComponent]);
        }

        protected onLoop(
            components: [RapierComponent][],
            entities: Entity[],
            deltaTime: number
        ): void {
            for (let i = 0; i < components.length; i++) {
                const [rapierComponent] = components[i];
                if (
                    rapierComponent.body &&
                    rapierComponent.body.translation().y < -10
                ) {
                    rapierComponent.body.setTranslation(
                        {
                            x: Math.random() * 10 - 5,
                            y: 30,
                            z: Math.random() * 10 - 5,
                        },
                        true
                    );
                    rapierComponent.body.setLinvel({ x: 0, y: 0, z: 0 }, true);
                    rapierComponent.body.setAngvel({ x: 0, y: 0, z: 0 }, true);
                }
            }
        }
    }

    const ambientLight = ecsManager.createEntity();
    ambientLight.addComponent(
        new ThreeLightComponent(new AmbientLight(0xffffff, 0.2))
    );

    await ecsManager.addSystem(new RespawnSystem());

    return ecsManager;
};
