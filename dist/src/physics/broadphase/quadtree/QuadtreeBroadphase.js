import Broadphase from "../Broadphase";
import Quadtree from "./Quadtree";
import AxisAlignedBoundingBox from "../../AxisAlignedBoundingBox";
import Body from "../../bodies/Body";
export default class QuadtreeBroadphase extends Broadphase {
    quadtree;
    constructor(minimum, maximum) {
        super();
        this.quadtree = new Quadtree(new AxisAlignedBoundingBox(minimum, maximum));
    }
    onEntityAdded(entity, components) {
        this.quadtree.addEntity(entity);
    }
    onEntityRemoved(entity, components) {
        this.quadtree.removeEntity(entity, components);
    }
    onEntityMoved(entity, components) {
        this.onEntityRemoved(entity, components);
        this.onEntityAdded(entity, components);
    }
    getCollisionPairs(entities) {
        const collisionPairs = [];
        for (let i = 0; i < entities.length; i++) {
            const entity = entities[i];
            const axisAlignedBoundingBox = entity
                .getComponent(Body)
                ?.getBoundingBox();
            if (!axisAlignedBoundingBox) {
                throw new Error("Axis aligned bounding box not found");
            }
            const neighbors = this.quadtree.getIntersectedEntities(axisAlignedBoundingBox);
            for (let i1 = 0; i1 < neighbors.length; i1++) {
                const neighbor = neighbors[i1];
                // Add the collision pair if not already added
                if (neighbor !== entity &&
                    !collisionPairs.includes([entity, neighbor]) &&
                    !collisionPairs.includes([neighbor, entity])) {
                    collisionPairs.push([entity, neighbor]);
                }
            }
        }
        return collisionPairs;
    }
}
