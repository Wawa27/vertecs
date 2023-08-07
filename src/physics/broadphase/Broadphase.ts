import { Entity } from "../../core";

export default abstract class Broadphase {
    public constructor() {}

    abstract onEntityAdded(entity: Entity): void;

    abstract onEntityRemoved(entity: Entity): void;

    abstract onEntityMoved(entity: Entity): void;

    abstract getCollisionPairs(entities: Entity[]): [Entity, Entity][];
}
