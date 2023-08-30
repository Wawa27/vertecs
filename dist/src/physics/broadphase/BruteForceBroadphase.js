import Broadphase from "./Broadphase";
import Body from "../bodies/Body";
/**
 * A brute force approach to broadphase, it checks every entity with every other entity
 */
export default class BruteForceBroadphase extends Broadphase {
    constructor() {
        super();
    }
    onEntityAdded(entity) { }
    getCollisionPairs(entities) {
        const pairs = [];
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
    onEntityRemoved(entity) { }
    onEntityMoved(entity) { }
}
