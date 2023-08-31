import { vec3 } from "ts-gl-matrix";
import { SerializableComponent } from "../../io";
import AxisAlignedBoundingBox from "../AxisAlignedBoundingBox";
export default class Body extends SerializableComponent {
    $movable;
    $boundingBox;
    $mass;
    constructor(bodyOptions) {
        super();
        this.$movable = bodyOptions?.movable ?? true;
        this.$boundingBox = new AxisAlignedBoundingBox(vec3.create(), vec3.create());
        this.$mass = bodyOptions?.mass ?? 0;
    }
    hasMoved() {
        const boundingBox = this.getBoundingBox();
        if (!vec3.equals(this.$boundingBox.minimum, boundingBox.minimum) ||
            !vec3.equals(this.$boundingBox.maximum, boundingBox.maximum)) {
            this.$boundingBox = boundingBox;
            return true;
        }
        return false;
    }
    get mass() {
        return this.$mass;
    }
    get movable() {
        return this.$movable;
    }
    set movable(movable) {
        this.$movable = movable;
    }
}
