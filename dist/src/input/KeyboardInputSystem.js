import { System } from "../core";
export default class KeyboardInputSystem extends System {
    #pressedKeys = new Set();
    #keyDownEvents;
    #keyUpEvents;
    #canvasId;
    constructor(filter, canvasId, tps) {
        super(filter, tps);
        this.#keyDownEvents = [];
        this.#keyUpEvents = [];
        this.#canvasId = canvasId;
    }
    async initialize() {
        if (this.#canvasId) {
            const canvas = document.getElementsByTagName("canvas")[0];
            if (!canvas) {
                throw new Error(`Canvas not found with id: ${this.#canvasId}`);
            }
            document.addEventListener("keydown", (e) => this.#keyDownEvents.push(e));
            document.addEventListener("keyup", (e) => this.#keyUpEvents.push(e));
        }
        else {
            document.addEventListener("keydown", (e) => this.#keyDownEvents.push(e));
            document.addEventListener("keyup", (e) => this.#keyUpEvents.push(e));
        }
    }
    onLoop() {
        this.#pressedKeys.forEach((key) => this.onKeyRepeat(key));
        this.#keyDownEvents.forEach((event) => {
            if (!this.#pressedKeys.has(event.key.toLowerCase())) {
                this.#pressedKeys.add(event.key.toLowerCase());
                this.onKeyDown(event.key.toLowerCase());
            }
        });
        this.#keyUpEvents.forEach((event) => {
            this.#pressedKeys.delete(event.key.toLowerCase());
            this.onKeyUp(event.key.toLowerCase());
        });
        this.#keyDownEvents = [];
        this.#keyUpEvents = [];
    }
}
