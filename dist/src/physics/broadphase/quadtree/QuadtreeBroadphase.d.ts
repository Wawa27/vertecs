import { Vec3Like } from "ts-gl-matrix";
import Broadphase from "../Broadphase";
import { Entity } from "../../../core";
import Body from "../../bodies/Body";
import { Transform } from "../../../math";
export default class QuadtreeBroadphase extends Broadphase {
    private quadtree;
    constructor(minimum: Vec3Like, maximum: Vec3Like);
    onEntityAdded(entity: Entity, components: [Body, Transform]): void;
    onEntityRemoved(entity: Entity, components: [Body, Transform]): void;
    onEntityMoved(entity: Entity, components: [Body, Transform]): void;
    getCollisionPairs(entities: Entity[]): [Entity, Entity][];
}
