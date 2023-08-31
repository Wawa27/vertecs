import { Vec3Like } from "ts-gl-matrix";
import { Component, Entity } from "../core";
export default class Collision extends Component {
    #private;
    constructor(position: Vec3Like, collidingWith: Entity);
    get position(): Vec3Like;
    get collidingWith(): Entity;
}
