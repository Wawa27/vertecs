import { Entity, System } from "../core";
export default abstract class MouseInputSystem extends System<[]> {
    #private;
    protected constructor(canvasId?: string, tps?: number);
    initialize(): Promise<void>;
    onLoop(components: [], entities: Entity[]): void;
    abstract onMouseMove(event: MouseEvent): void;
    abstract onMouseDown(event: MouseEvent): void;
    abstract onMouseUp(event: MouseEvent): void;
    abstract onMouseWheel(event: WheelEvent): void;
}
