# Vertecs

![](docs/example.mp4)

## A typescript entity-component-system framework

### Installation

    npm install vertecs

### Usage

Start by creating a component class.

```typescript
import { Component } from "vertecs";

export default class PositionComponent extends Component {
    public x: number;
    public y: number;

    public constructor(x: number, y: number) {
        super();
        this.x = x;
        this.y = y;
    }
}
```

Now, create a system that updates the position of a component.

```typescript
import { System } from "vertecs";

export default class PositionSystem extends System {

    public constructor() {
        super([PositionComponent], 60);
    }

    public onLoop(entities: Entity[], deltaTime: number) {
        entities.forEach(entity => {
            const position = entity.getComponent(PositionComponent);
            position.x += 1 * deltaTime;
            console.log("Position:", position.x, position.y);
        });
    }
}
```

Finally, add the system to the ecs manager, create an entity and start the ecs manager

```typescript
import { SystemManager, Entity, EcsManager } from "vertecs";
import { PositionComponent } from "./PositionComponent";
import { PositionSystem } from "./PositionSystem";

const ecsManager = new EcsManager();

ecsManager.addSystem(new PositionSystem());

const entity = new Entity();
entity.addComponent(new PositionComponent(0, 0));

ecsManager.addEntity(entity)

ecsManager.start(); // -> Position: .., ..
```

### Hello world

```typescript
import { BoxGeometry, Mesh, MeshBasicMaterial, PerspectiveCamera } from "three";
import { EcsManager, ThreeCameraComponent, Transform, ThreeSystem, ThreeMesh } from "vertecs";

const ecsManager = new EcsManager();

await ecsManager.addSystem(new ThreeSystem());

const cube = ecsManager.createEntity({ name: "cube" });
cube.addComponent(new Transform([0, 0, 0]));
cube.addComponent(
    new ThreeMesh(
        new Mesh(
            new BoxGeometry(1, 1, 1),
            new MeshBasicMaterial({ color: 0x00ff00 })
        )
    )
);

const camera = ecsManager.createEntity({ name: "camera" });
camera.addComponent(new Transform([0, 0, 2]));
camera.addComponent(
    new ThreeCameraComponent(
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
```

This example will create a green cube in the center of the screen.

### Network

Vertecs comes with a built-in networking system.

The networking system is based on the [ws](https://github.com/websockets/ws) library.

The `ClientHandler` class, that must be extended and provided to the `ServerNetworkSystem` class is used to handle
client connections/disconnections and messages.

On the client side, the `ClientNetworkSystem` class is used to connect to the server and send messages.

Only components that extends the `NetworkComponent` class will be synced over the network.

There's three methods (`shouldUpdate`, `shouldUpdateClient`, `shouldUpdateClients`) that can be overridden to customize
the component synchronization behavior.
