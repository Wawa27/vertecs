import { Component } from "../core";
export default class Collision extends Component {
    #position;
    #collidingWith;
    constructor(position, collidingWith) {
        super();
        this.#position = position;
        this.#collidingWith = collidingWith;
    }
    get position() {
        return this.#position;
    }
    get collidingWith() {
        return this.#collidingWith;
    }
}
