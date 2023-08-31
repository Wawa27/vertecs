import { Component } from "../../../../src";
export default class Velocity extends Component {
    #x;
    #y;
    constructor() {
        super();
        this.#x = 0;
        this.#y = 0;
    }
    get x() {
        return this.#x;
    }
    set x(value) {
        this.#x = value;
    }
    get y() {
        return this.#y;
    }
    set y(value) {
        this.#y = value;
    }
}
