import { Component } from "../../core";

export default class TimedState extends Component {
    #duration: number;

    #repeat: number;

    #nextStateName?: string;

    #startTime: number;

    public constructor(
        duration: number,
        repeat: number,
        nextStateName?: string
    ) {
        super();
        this.#nextStateName = nextStateName;
        this.#duration = duration;
        this.#repeat = repeat;
        this.#startTime = new Date().getTime();
    }

    public get duration(): number {
        return this.#duration;
    }

    public get repeat(): number {
        return this.#repeat;
    }

    public get startTime(): number {
        return this.#startTime;
    }

    public set startTime(startTime: number) {
        this.#startTime = startTime;
    }

    public get nextStateName(): string | undefined {
        return this.#nextStateName;
    }
}
