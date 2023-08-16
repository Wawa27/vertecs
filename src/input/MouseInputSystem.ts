import { Entity, System } from "../core";

export default abstract class MouseInputSystem extends System<[]> {
    #buffer: (MouseEvent | WheelEvent)[];

    readonly #canvasId?: string;

    protected constructor(canvasId?: string, tps?: number) {
        super([], tps);
        this.#buffer = [];
        this.#canvasId = canvasId;
    }

    async initialize(): Promise<void> {
        if (this.#canvasId) {
            const canvas = document.getElementById(this.#canvasId);
            if (!canvas) {
                throw new Error(`Canvas not found with id: ${this.#canvasId}`);
            }
            canvas.addEventListener("mousedown", (e) => this.#buffer.push(e));
            canvas.addEventListener("mouseup", (e) => this.#buffer.push(e));
            canvas.addEventListener("mousemove", (e) => this.#buffer.push(e));
            canvas.addEventListener("wheel", (e) => this.#buffer.push(e));
        } else {
            document.addEventListener("mousedown", (e) => this.#buffer.push(e));
            document.addEventListener("mouseup", (e) => this.#buffer.push(e));
            document.addEventListener("mousemove", (e) => this.#buffer.push(e));
        }
    }

    public onLoop(components: [], entities: Entity[]): void {
        this.#buffer.forEach((event) => {
            switch (event.type) {
                case "mousemove":
                    return this.onMouseMove(event as MouseEvent);
                case "mousedown":
                    return this.onMouseDown(event as MouseEvent);
                case "mouseup":
                    return this.onMouseUp(event as MouseEvent);
                case "wheel":
                    return this.onMouseWheel(event as WheelEvent);
                default:
                    return null;
            }
        });

        // clear buffer
        this.#buffer.length = 0;
    }

    abstract onMouseMove(event: MouseEvent): void;

    abstract onMouseDown(event: MouseEvent): void;

    abstract onMouseUp(event: MouseEvent): void;

    abstract onMouseWheel(event: WheelEvent): void;
}
