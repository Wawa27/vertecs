import { Component } from "../../core";
import { NetworkComponent } from "../index";
type AnimationData = {
    name: string;
    duration: number;
    startTime: number;
    repeat: number;
};
/**
 * Represents an animation being played on an entity
 */
export default class NetworkAnimation extends NetworkComponent<AnimationData> {
    constructor();
    accept(data: AnimationData): boolean;
    isDirty(lastData: AnimationData): boolean;
    read(data: AnimationData): void;
    write(): AnimationData;
    clone(): Component;
}
export {};
