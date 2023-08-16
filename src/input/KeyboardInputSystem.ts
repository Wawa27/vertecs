import { System } from "../core";
import type { ComponentClass } from "../core/Component";
import Component from "../core/Component";

export default abstract class KeyboardInputSystem extends System<[Component]> {
    #pressedKeys: Set<string> = new Set();

    #keyDownEvents: KeyboardEvent[];

    #keyUpEvents: KeyboardEvent[];

    readonly #canvasId?: string;

    protected constructor(
        filter: ComponentClass[],
        canvasId: string,
        tps?: number
    ) {
        super(filter, tps);
        this.#keyDownEvents = [];
        this.#keyUpEvents = [];
        this.#canvasId = canvasId;
    }

    async initialize(): Promise<void> {
        if (this.#canvasId) {
            const canvas = document.getElementsByTagName("canvas")[0];
            if (!canvas) {
                throw new Error(`Canvas not found with id: ${this.#canvasId}`);
            }
            document.addEventListener("keydown", (e) =>
                this.#keyDownEvents.push(e)
            );
            document.addEventListener("keyup", (e) =>
                this.#keyUpEvents.push(e)
            );
        } else {
            document.addEventListener("keydown", (e) =>
                this.#keyDownEvents.push(e)
            );
            document.addEventListener("keyup", (e) =>
                this.#keyUpEvents.push(e)
            );
        }
    }

    abstract onKeyDown(key: string): void;

    abstract onKeyRepeat(key: string): void;

    abstract onKeyUp(key: string): void;

    public onLoop(): void {
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
