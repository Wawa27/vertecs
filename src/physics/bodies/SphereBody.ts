import { vec3 } from "ts-gl-matrix";
import Body, { BodyOptions, PhysicsData } from "./Body";
import AxisAlignedBoundingBox from "../AxisAlignedBoundingBox";
import { Transform } from "../../math";

type SphereBodyOptions = BodyOptions & {
    radius: number;
};

export default class SphereBody extends Body {
    #radius: number;

    public constructor(sphereBodyOptions: SphereBodyOptions) {
        super(sphereBodyOptions);
        this.#radius = sphereBodyOptions.radius;
    }

    public getBoundingBox(): AxisAlignedBoundingBox {
        const position = this.entity
            ?.getComponent(Transform)
            ?.getWorldPosition();

        if (!position) {
            throw new Error("SphereBody needs a Transform component");
        }

        return new AxisAlignedBoundingBox(
            vec3.fromValues(
                position[0] - this.#radius,
                position[1] - this.#radius,
                position[2] - this.#radius
            ),
            vec3.fromValues(
                position[0] + this.#radius,
                position[1] + this.#radius,
                position[2] + this.#radius
            )
        );
    }

    public get radius(): number {
        return this.#radius;
    }

    public set radius(radius: number) {
        this.#radius = radius;
    }

    public read(data: PhysicsData): void {
        this.#radius = data.radius;
    }

    public write(): PhysicsData {
        return {
            movable: this.$movable,
            radius: this.#radius,
            mass: this.$mass,
        };
    }

    public clone(): SphereBody {
        return new SphereBody({
            radius: this.#radius,
            movable: this.$movable,
            mass: this.$mass,
        });
    }
}
