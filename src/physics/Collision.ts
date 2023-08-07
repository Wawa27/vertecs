import { vec3 } from "gl-matrix";
import { Component, Entity } from "../core";

export default class Collision extends Component {
    #position: vec3;

    #collidingWith: Entity;

    public constructor(position: vec3, collidingWith: Entity) {
        super();
        this.#position = position;
        this.#collidingWith = collidingWith;
    }
}
