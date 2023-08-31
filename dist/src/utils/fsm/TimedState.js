import { Component } from "../../core";
export default class TimedState extends Component {
    #duration;
    #repeat;
    #nextStateName;
    #startTime;
    constructor(duration, repeat, nextStateName) {
        super();
        this.#nextStateName = nextStateName;
        this.#duration = duration;
        this.#repeat = repeat;
        this.#startTime = new Date().getTime();
    }
    get duration() {
        return this.#duration;
    }
    get repeat() {
        return this.#repeat;
    }
    get startTime() {
        return this.#startTime;
    }
    set startTime(startTime) {
        this.#startTime = startTime;
    }
    get nextStateName() {
        return this.#nextStateName;
    }
}
