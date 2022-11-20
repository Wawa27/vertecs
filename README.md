# ECS

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

Finally, add the system to the system manager, create an entity and start the system manager

```typescript
import { SystemManager, Entity } from "vertecs";
import { PositionComponent } from "./PositionComponent";
import { PositionSystem } from "./PositionSystem";

const systemManager = new SystemManager.getInstance();

systemManager.addSystem(new PositionSystem());

const entity = new Entity();
entity.addComponent(new PositionComponent(0, 0));

systemManager.addEntity(entity)

systemManager.start(); // -> Position: .., ..
```

### Networking

Vertecs comes with a built-in networking system.

Only components that extends the `NetworkComponent` class will be synced over the network.

#### Example updating the PositionComponent over the network

First, create a network component class.

```typescript
import { NetworkComponent } from "vertecs";

type PositionComponentData = {
    x: number;
    y: number;
}

export default class PositionComponentSynchronizer extends NetworkComponent<PositionComponentData> {
    #lastUpdate: number;

    public constructor() {
        super();
    }

    public onAddedToEntity(entity: Entity) {
        // The component might come from the network, so we need to make sure that the entity has a PositionComponent
        if (!entity.hasComponent(PositionComponent)) {
            entity.addComponent(new PositionComponent(0, 0));
        }
    }
    
    public accept(data: PositionComponentData) {
        return true;
    }
    
    public isDirty() {
        // In this example, we update 
        if (Date.now() - this.#lastUpdate > 1000) {
            this.#lastUpdate = this.entity.getComponent(PositionComponent).x;
            return true;
        }
    }

    public serialize(): PositionComponentData {
        const position = this.$entity.getComponent(PositionComponent);
        return {
            x: position.x,
            y: position.y
        };
    }

    public deserialize(data: PositionComponentData): void {
        const position = this.$entity.getComponent(PositionComponent);
        position.x = data.x;
        position.y = data.y;
    }
}
```

Now, create both network systems.

```typescript
import { NetworkSystem } from "vertecs";

