import Broadphase from "./Broadphase";
import { Entity } from "../../core";
import Body from "../bodies/Body";

/**
 * A brute force approach to broadphase, it checks every entity with every other entity
 */
export default class BruteForceBroadphase extends Broadphase {
    public constructor() {
        super();
    }

    public onEntityAdded(entity: Entity): void {}

    public getCollisionPairs(entities: Entity[]): [Entity, Entity][] {
        const pairs: [Entity, Entity][] = [];
        entities.forEach((entity1) => {
            entities.forEach((entity2) => {
                if (entity1.id !== entity2.id) {
                    const body1 = entity1.getComponent(Body);
                    const body2 = entity2.getComponent(Body);

                    if (!body1?.movable && !body2?.movable) {
                        return;
                    }

                    pairs.push([entity1, entity2]);
                }
            });
        });
        return pairs;
    }

    public onEntityRemoved(entity: Entity): void {}

    public onEntityMoved(entity: Entity): void {}
}
