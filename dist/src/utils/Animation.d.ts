import { Component } from "../core";
/**
 * Represents an animation being played on an entity
 */
export default class Animation extends Component {
    #private;
    constructor(name: string, duration: number, repeat: number, startTime: number);
    get name(): string;
    set name(name: string);
    get duration(): number;
    set duration(duration: number);
    get startTime(): number;
    set startTime(startTime: number);
    get repeat(): number;
    set repeat(repeat: number);
    clone(): Component;
}
