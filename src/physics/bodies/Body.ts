import { vec3 } from "ts-gl-matrix";
import { Component } from "../../core";
import { SerializableComponent } from "../../io";
import AxisAlignedBoundingBox from "../AxisAlignedBoundingBox";

export type PhysicsData = {
    movable: boolean;
    [key: string]: any;
};

export default abstract class Body extends SerializableComponent<PhysicsData> {
    protected $movable: boolean;

    protected $boundingBox: AxisAlignedBoundingBox;

    protected constructor(movable: boolean) {
        super();
        this.$movable = movable;
        this.$boundingBox = new AxisAlignedBoundingBox(
            vec3.create(),
            vec3.create()
        );
    }

    public abstract getBoundingBox(): AxisAlignedBoundingBox;

    public abstract read(data: PhysicsData): void;

    public abstract write(): PhysicsData;

    public hasMoved(): boolean {
        const boundingBox = this.getBoundingBox();
        if (
            !vec3.equals(this.$boundingBox.minimum, boundingBox.minimum) ||
            !vec3.equals(this.$boundingBox.maximum, boundingBox.maximum)
        ) {
            this.$boundingBox = boundingBox;
            return true;
        }
        return false;
    }

    public get movable(): boolean {
        return this.$movable;
    }

    public set movable(movable: boolean) {
        this.$movable = movable;
    }

    public abstract clone(): Component;
}
