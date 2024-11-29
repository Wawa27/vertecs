import { Vec3Like } from "ts-gl-matrix";

export default class AxisAlignedBoundingBox {
    #minimum: Vec3Like;

    #maximum: Vec3Like;

    public constructor(min: Vec3Like, max: Vec3Like) {
        this.#minimum = min;
        this.#maximum = max;
    }

    public contains(point: Vec3Like): boolean {
        return (
            point[0] >= this.#minimum[0] &&
            point[0] <= this.#maximum[0] &&
            point[1] >= this.#minimum[1] &&
            point[1] <= this.#maximum[1] &&
            point[2] >= this.#minimum[2] &&
            point[2] <= this.#maximum[2]
        );
    }

    public intersects(other: AxisAlignedBoundingBox): boolean {
        return (
            this.#minimum[0] <= other.#maximum[0] &&
            this.#maximum[0] >= other.#minimum[0] &&
            this.#minimum[1] <= other.#maximum[1] &&
            this.#maximum[1] >= other.#minimum[1] &&
            this.#minimum[2] <= other.#maximum[2] &&
            this.#maximum[2] >= other.#minimum[2]
        );
    }

    public get minimum(): Vec3Like {
        return this.#minimum;
    }

    public get maximum(): Vec3Like {
        return this.#maximum;
    }
}
