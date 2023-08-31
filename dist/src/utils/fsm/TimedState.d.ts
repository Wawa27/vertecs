import { Component } from "../../core";
export default class TimedState extends Component {
    #private;
    constructor(duration: number, repeat: number, nextStateName?: string);
    get duration(): number;
    get repeat(): number;
    get startTime(): number;
    set startTime(startTime: number);
    get nextStateName(): string | undefined;
}
