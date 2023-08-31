import { Component } from "../../../src";
export default class PositionComponent extends Component {
    #x;
    #y;
    constructor(x, y) {
        super();
        this.#x = x;
        this.#y = y;
    }
    onAddedToEntity(entity) {
        console.debug("PositionComponent added to entity");
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
