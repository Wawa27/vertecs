import { System } from "../core";
import type { ComponentClass } from "../core/Component";
import Component from "../core/Component";
export default abstract class KeyboardInputSystem extends System<[Component]> {
    #private;
    protected constructor(filter: ComponentClass[], canvasId: string, tps?: number);
    initialize(): Promise<void>;
    abstract onKeyDown(key: string): void;
    abstract onKeyRepeat(key: string): void;
    abstract onKeyUp(key: string): void;
    onLoop(): void;
}
