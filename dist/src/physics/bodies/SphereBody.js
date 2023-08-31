import { vec3 } from "ts-gl-matrix";
import Body from "./Body";
import AxisAlignedBoundingBox from "../AxisAlignedBoundingBox";
import { Transform } from "../../math";
export default class SphereBody extends Body {
    #radius;
    constructor(sphereBodyOptions) {
        super(sphereBodyOptions);
        this.#radius = sphereBodyOptions.radius;
    }
    getBoundingBox() {
        const position = this.entity
            ?.getComponent(Transform)
            ?.getWorldPosition();
        if (!position) {
            throw new Error("SphereBody needs a Transform component");
        }
        return new AxisAlignedBoundingBox(vec3.fromValues(position[0] - this.#radius, position[1] - this.#radius, position[2] - this.#radius), vec3.fromValues(position[0] + this.#radius, position[1] + this.#radius, position[2] + this.#radius));
    }
    get radius() {
        return this.#radius;
    }
    set radius(radius) {
        this.#radius = radius;
    }
    read(data) {
        this.#radius = data.radius;
    }
    write() {
        return {
            movable: this.$movable,
            radius: this.#radius,
            mass: this.$mass,
        };
    }
    clone() {
        return new SphereBody({
            radius: this.#radius,
            movable: this.$movable,
            mass: this.$mass,
        });
    }
}
