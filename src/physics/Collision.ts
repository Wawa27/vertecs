import { Vec3Like } from "ts-gl-matrix";
import { Component, Entity } from "../core";

export default class Collision extends Component {
    #position: Vec3Like;

    #collidingWith: Entity;

    public constructor(position: Vec3Like, collidingWith: Entity) {
        super();
        this.#position = position;
        this.#collidingWith = collidingWith;
    }

    public get position(): Vec3Like {
        return this.#position;
    }

    public get collidingWith(): Entity {
        return this.#collidingWith;
    }
}
