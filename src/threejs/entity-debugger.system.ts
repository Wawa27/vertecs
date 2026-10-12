import { Scene } from "three";
import { Entity } from "../core";
import KeyboardInputSystem from "../input/KeyboardInputSystem";
import EntityDebugger from "./EntityDebugger";
import ThreeObject3DComponent from "./three-object3D.component";

export default class EntityDebuggerSystem extends KeyboardInputSystem {
    #visible: boolean;

    #entities: Set<Entity>;

    public constructor(_scene?: Scene, tps?: number) {
        super([EntityDebugger], "canvas", tps);
        this.#visible = false;
        this.#entities = new Set();
    }

    public onEntityEligible(entity: Entity): void {
        this.#entities.add(entity);
    }

    public onEntityNoLongerEligible(entity: Entity): void {
        this.#entities.delete(entity);
    }

    public onKeyDown(key: string): void {
        if (key === "p") {
            this.#visible = !this.#visible;
        }
    }

    public onKeyRepeat(_key: string): void {}

    public onKeyUp(_key: string): void {}

    public onLoop(): void {
        super.onLoop();

        this.#entities.forEach((entity) => {
            const child = entity.findChildByName("entity-debugger");
            if (child) {
                const threeObject = child.getComponent(ThreeObject3DComponent);
                if (threeObject) {
                    threeObject.object3D.visible = this.#visible;
                }
            }
        });
    }
}
