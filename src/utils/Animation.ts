import { Component } from "../core";

/**
 * Represents an animation being played on an entity
 */
export default class Animation extends Component {
    #name: string;

    #duration: number;

    #startTime: number;

    #repeat: number;

    public constructor(
        name: string,
        duration: number,
        repeat: number,
        startTime: number
    ) {
        super();
        this.#name = name;
        this.#duration = duration;
        this.#repeat = repeat ?? 0;
        this.#startTime = startTime ?? Date.now();
    }

    public get name(): string {
        return this.#name;
    }

    public set name(name: string) {
        this.#name = name;
        this.#startTime = Date.now();
    }

    public get duration(): number {
        return this.#duration;
    }

    public set duration(duration: number) {
        this.#duration = duration;
    }

    public get startTime(): number {
        return this.#startTime;
    }

    public set startTime(startTime: number) {
        this.#startTime = startTime;
    }

    public get repeat(): number {
        return this.#repeat;
    }

    public set repeat(repeat: number) {
        this.#repeat = repeat;
    }

    public clone(): Component {
        return new Animation(
            this.#name,
            this.#duration,
            this.#repeat,
            Date.now()
        );
    }
}
