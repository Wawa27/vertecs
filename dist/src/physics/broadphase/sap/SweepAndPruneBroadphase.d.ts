import Broadphase from "../Broadphase";
import { Entity } from "../../../core";
export default class SweepAndPruneBroadphase extends Broadphase {
    #private;
    constructor();
    onEntityAdded(entity: Entity): void;
    onEntityRemoved(entity: Entity): void;
    onEntityMoved(entity: Entity): void;
    getCollisionPairs(entities: Entity[]): [Entity, Entity][];
    private updateCollisionPairs;
    private sortEndpoints;
}
