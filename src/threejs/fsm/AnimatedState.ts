import TimedState from "../../utils/fsm/TimedState";

export default class AnimatedState extends TimedState {
    #name: string;

    public constructor(
        animationName: string,
        duration: number,
        repeat: number,
        nextStateName?: string
    ) {
        super(duration, repeat, nextStateName);
        this.#name = animationName;
    }

    public get name(): string {
        return this.#name;
    }
}
