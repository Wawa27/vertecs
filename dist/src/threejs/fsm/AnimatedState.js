import TimedState from "../../utils/fsm/TimedState";
export default class AnimatedState extends TimedState {
    #name;
    constructor(animationName, duration, repeat, nextStateName) {
        super(duration, repeat, nextStateName);
        this.#name = animationName;
    }
    get name() {
        return this.#name;
    }
}
