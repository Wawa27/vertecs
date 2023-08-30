<h1 align="center">
    Vertecs
</h1>

Vertecs (Word contraction of Vertex and ECS)  is a robust TypeScript library designed around the ECS (Entity Component System) pattern. It's tailored for game development and beyond.

## 🚀 Features

- Three.js Integration: Render any Three.js object seamlessly.
- Prefabs: Easily instantiate entities multiple times.
- System Dependencies: Define dependencies between systems for ordered updates.
- Networking: Built-in networking system using Websockets for real-time synchronization.

## 📦 Installation

`npm install vertecs`

## 🎮 Getting Started

### 1. Create a Component

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

### 2. Define a System

```typescript
import { System } from "vertecs";
import PositionComponent from "./PositionComponent";

export default class PositionSystem extends System<[PositionComponent]> {

    public constructor() {
        super([PositionComponent], 60);
    }

    public onLoop(components: [PositionComponent][], entities: Entity[], deltaTime: number) {
        for (let i = 0; i < components.length; i++) {
            const [positionComponent] = components[i];
            positionComponent.x += 1 * deltaTime;
            console.log("Position:", positionComponent.x, positionComponent.y);
        }
    }
}
```

### 3. Integrate with ECS Manager

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

## 🎨 Examples

Explore the examples folder for practical implementations of Vertecs. To run:

1. Clone the repository.
2. Install dependencies with `npm install`.
3. Build examples using `npm run build:examples`.
4. Open the .html files in the examples folder with your browser.

## 🤝 Contributing

Contributions, issues and feature requests are all welcome !

### To contribute :

1. Fork the repository.
2. Create your feature branch (git checkout -b feature/YourFeatureName).
3. Commit your changes.
4. Push to the branch (git push origin feature/YourFeatureName).
5. Open a pull request.

Pull requests must follow the [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) specification.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE.md) file for details.
