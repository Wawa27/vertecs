export default class AxisAlignedBoundingBox {
    #minimum;
    #maximum;
    constructor(min, max) {
        this.#minimum = min;
        this.#maximum = max;
    }
    contains(point) {
        return (point[0] >= this.#minimum[0] &&
            point[0] <= this.#maximum[0] &&
            point[1] >= this.#minimum[1] &&
            point[1] <= this.#maximum[1] &&
            point[2] >= this.#minimum[2] &&
            point[2] <= this.#maximum[2]);
    }
    intersects(other) {
        return (this.#minimum[0] <= other.#maximum[0] &&
            this.#maximum[0] >= other.#minimum[0] &&
            this.#minimum[1] <= other.#maximum[1] &&
            this.#maximum[1] >= other.#minimum[1] &&
            this.#minimum[2] <= other.#maximum[2] &&
            this.#maximum[2] >= other.#minimum[2]);
    }
    get minimum() {
        return this.#minimum;
    }
    get maximum() {
        return this.#maximum;
    }
}
