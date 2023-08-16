import { vec3 } from "ts-gl-matrix";
import Body, { PhysicsData } from "./Body";
import AxisAlignedBoundingBox from "../AxisAlignedBoundingBox";
import { Transform } from "../../math";
import { Component } from "../../core";

export default class CubeBody extends Body {
    #width: number;

    #height: number;

    #depth: number;

    public constructor(width: number, height: number, depth: number) {
        super(true);

        this.#width = width;
        this.#height = height;
        this.#depth = depth;
    }

    public getBoundingBox(): AxisAlignedBoundingBox {
        const position = this.entity
            ?.getComponent(Transform)
            ?.getWorldPosition();

        if (!position) {
            throw new Error("CubeBody needs a Transform component");
        }

        return new AxisAlignedBoundingBox(
            vec3.fromValues(
                position[0] - this.#width / 2,
                position[1] - this.#height / 2,
                position[2] - this.#depth / 2
            ),
            vec3.fromValues(
                position[0] + this.#width / 2,
                position[1] + this.#height / 2,
                position[2] + this.#depth / 2
            )
        );
    }

    public read(data: PhysicsData): void {}

    public write(): PhysicsData {
        return {
            movable: true,
        };
    }

    public get width(): number {
        return this.#width;
    }

    public set width(value: number) {
        this.#width = value;
    }

    public get height(): number {
        return this.#height;
    }

    public set height(value: number) {
        this.#height = value;
    }

    public get depth(): number {
        return this.#depth;
    }

    public set depth(value: number) {
        this.#depth = value;
    }

    public clone(): Component {
        throw new Error("Method not implemented.");
    }
}
