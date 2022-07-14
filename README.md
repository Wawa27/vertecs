# ECS

## A typescript entity-component-system framework

### Installation

    npm install vertecs

### Usage

Start by creating a component class.

```typescript
import {Component} from "vertecs";

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
import {System} from "vertecs";

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
import {SystemManager, Entity} from "vertecs";
import {PositionComponent} from "./PositionComponent";
import {PositionSystem} from "./PositionSystem";

const systemManager = new SystemManager.getInstance();

systemManager.addSystem(new PositionSystem());

const entity = new Entity();
entity.addComponent(new PositionComponent(0, 0));

systemManager.addEntity(entity)

systemManager.start(); // -> Position: .., ..
```