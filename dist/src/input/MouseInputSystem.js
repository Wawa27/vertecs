import { System } from "../core";
export default class MouseInputSystem extends System {
    #buffer;
    #canvasId;
    constructor(canvasId, tps) {
        super([], tps);
        this.#buffer = [];
        this.#canvasId = canvasId;
    }
    async initialize() {
        if (this.#canvasId) {
            const canvas = document.getElementsByTagName("canvas")[0];
            if (!canvas) {
                throw new Error(`Canvas not found with id: ${this.#canvasId}`);
            }
            canvas.addEventListener("mousedown", (e) => this.#buffer.push(e));
            canvas.addEventListener("mouseup", (e) => this.#buffer.push(e));
            canvas.addEventListener("mousemove", (e) => this.#buffer.push(e));
            canvas.addEventListener("wheel", (e) => this.#buffer.push(e));
        }
        else {
            document.addEventListener("mousedown", (e) => this.#buffer.push(e));
            document.addEventListener("mouseup", (e) => this.#buffer.push(e));
            document.addEventListener("mousemove", (e) => this.#buffer.push(e));
        }
    }
    onLoop(components, entities) {
        this.#buffer.forEach((event) => {
            switch (event.type) {
                case "mousemove":
                    return this.onMouseMove(event);
                case "mousedown":
                    return this.onMouseDown(event);
                case "mouseup":
                    return this.onMouseUp(event);
                case "wheel":
                    return this.onMouseWheel(event);
                default:
                    return null;
            }
        });
        // clear buffer
        this.#buffer.length = 0;
    }
}
