import TimedState from "../../utils/fsm/TimedState";

export default class AnimatedState extends TimedState {
    #name: string;

    #playbackSpeed: number;

    public constructor(
        animationName: string,
        duration: number,
        repeat: number,
        nextStateName?: string,
        playbackSpeed = 1
    ) {
        super(duration, repeat, nextStateName);
        this.#name = animationName;
        this.#playbackSpeed = playbackSpeed;
    }

    public get playbackSpeed() {
        return this.#playbackSpeed;
    }

    public get name(): string {
        return this.#name;
    }
}
