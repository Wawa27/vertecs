import Body, { BodyOptions, PhysicsData } from "./Body";
import AxisAlignedBoundingBox from "../AxisAlignedBoundingBox";
import { Component } from "../../core";
type CubeBodyOptions = BodyOptions & {
    width: number;
    height: number;
    depth: number;
};
export default class CubeBody extends Body {
    #private;
    constructor(cubeBodyOptions: CubeBodyOptions);
    getBoundingBox(): AxisAlignedBoundingBox;
    read(data: PhysicsData): void;
    write(): PhysicsData;
    get width(): number;
    set width(value: number);
    get height(): number;
    set height(value: number);
    get depth(): number;
    set depth(value: number);
    clone(): Component;
}
export {};
