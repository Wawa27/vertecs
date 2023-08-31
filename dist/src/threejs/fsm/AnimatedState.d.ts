import TimedState from "../../utils/fsm/TimedState";
export default class AnimatedState extends TimedState {
    #private;
    constructor(animationName: string, duration: number, repeat: number, nextStateName?: string);
    get name(): string;
}
