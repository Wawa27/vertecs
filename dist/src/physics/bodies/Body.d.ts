import { Component } from "../../core";
import { SerializableComponent } from "../../io";
import AxisAlignedBoundingBox from "../AxisAlignedBoundingBox";
export type PhysicsData = {
    movable: boolean;
    [key: string]: any;
};
export type BodyOptions = {
    movable?: boolean;
    mass?: number;
};
export default abstract class Body extends SerializableComponent<PhysicsData> {
    protected $movable: boolean;
    protected $boundingBox: AxisAlignedBoundingBox;
    protected $mass: number;
    protected constructor(bodyOptions?: BodyOptions);
    abstract getBoundingBox(): AxisAlignedBoundingBox;
    abstract read(data: PhysicsData): void;
    abstract write(): PhysicsData;
    hasMoved(): boolean;
    get mass(): number;
    get movable(): boolean;
    set movable(movable: boolean);
    abstract clone(): Component;
}
