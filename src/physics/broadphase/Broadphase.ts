import { Entity } from "../../core";
import Body from "../bodies/Body";
import { Transform } from "../../math";

export default abstract class Broadphase {
    public constructor() {}

    abstract onEntityAdded(entity: Entity, components: [Body, Transform]): void;

    abstract onEntityRemoved(
        entity: Entity,
        components: [Body, Transform]
    ): void;

    abstract onEntityMoved(entity: Entity, components: [Body, Transform]): void;

    abstract getCollisionPairs(entities: Entity[]): [Entity, Entity][];
}
