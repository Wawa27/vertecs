import { vec3 } from "ts-gl-matrix";
import Body from "./Body";
import AxisAlignedBoundingBox from "../AxisAlignedBoundingBox";
import { Transform } from "../../math";
export default class CubeBody extends Body {
    #width;
    #height;
    #depth;
    constructor(cubeBodyOptions) {
        super(cubeBodyOptions);
        this.#width = cubeBodyOptions.width;
        this.#height = cubeBodyOptions.height;
        this.#depth = cubeBodyOptions.depth;
    }
    getBoundingBox() {
        const position = this.entity
            ?.getComponent(Transform)
            ?.getWorldPosition();
        if (!position) {
            throw new Error("CubeBody needs a Transform component");
        }
        return new AxisAlignedBoundingBox(vec3.fromValues(position[0] - this.#width / 2, position[1] - this.#height / 2, position[2] - this.#depth / 2), vec3.fromValues(position[0] + this.#width / 2, position[1] + this.#height / 2, position[2] + this.#depth / 2));
    }
    read(data) { }
    write() {
        return {
            movable: true,
        };
    }
    get width() {
        return this.#width;
    }
    set width(value) {
        this.#width = value;
    }
    get height() {
        return this.#height;
    }
    set height(value) {
        this.#height = value;
    }
    get depth() {
        return this.#depth;
    }
    set depth(value) {
        this.#depth = value;
    }
    clone() {
        throw new Error("Method not implemented.");
    }
}
