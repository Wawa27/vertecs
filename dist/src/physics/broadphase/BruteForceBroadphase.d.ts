import Broadphase from "./Broadphase";
import { Entity } from "../../core";
/**
 * A brute force approach to broadphase, it checks every entity with every other entity
 */
export default class BruteForceBroadphase extends Broadphase {
    constructor();
    onEntityAdded(entity: Entity): void;
    getCollisionPairs(entities: Entity[]): [Entity, Entity][];
    onEntityRemoved(entity: Entity): void;
    onEntityMoved(entity: Entity): void;
}
