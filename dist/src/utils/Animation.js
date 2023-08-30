import { Component } from "../core";
/**
 * Represents an animation being played on an entity
 */
export default class Animation extends Component {
    #name;
    #duration;
    #startTime;
    #repeat;
    constructor(name, duration, repeat, startTime) {
        super();
        this.#name = name;
        this.#duration = duration;
        this.#repeat = repeat ?? 0;
        this.#startTime = startTime ?? Date.now();
    }
    get name() {
        return this.#name;
    }
    set name(name) {
        this.#name = name;
        this.#startTime = Date.now();
    }
    get duration() {
        return this.#duration;
    }
    set duration(duration) {
        this.#duration = duration;
    }
    get startTime() {
        return this.#startTime;
    }
    set startTime(startTime) {
        this.#startTime = startTime;
    }
    get repeat() {
        return this.#repeat;
    }
    set repeat(repeat) {
        this.#repeat = repeat;
    }
    clone() {
        return new Animation(this.#name, this.#duration, this.#repeat, Date.now());
    }
}
