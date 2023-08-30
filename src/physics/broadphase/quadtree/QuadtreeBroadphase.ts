import { Vec3Like } from "ts-gl-matrix";
import Broadphase from "../Broadphase";
import { Entity } from "../../../core";
import Quadtree from "./Quadtree";
import AxisAlignedBoundingBox from "../../AxisAlignedBoundingBox";
import Body from "../../bodies/Body";
import { Transform } from "../../../math";

export default class QuadtreeBroadphase extends Broadphase {
    private quadtree: Quadtree;

    public constructor(minimum: Vec3Like, maximum: Vec3Like) {
        super();
        this.quadtree = new Quadtree(
            new AxisAlignedBoundingBox(minimum, maximum)
        );
    }

    public onEntityAdded(entity: Entity, components: [Body, Transform]): void {
        this.quadtree.addEntity(entity);
    }

    public onEntityRemoved(
        entity: Entity,
        components: [Body, Transform]
    ): void {
        this.quadtree.removeEntity(entity, components);
    }

    public onEntityMoved(entity: Entity, components: [Body, Transform]): void {
        this.onEntityRemoved(entity, components);
        this.onEntityAdded(entity, components);
    }

    public getCollisionPairs(entities: Entity[]): [Entity, Entity][] {
        const collisionPairs: [Entity, Entity][] = [];
        for (let i = 0; i < entities.length; i++) {
            const entity = entities[i];
            const axisAlignedBoundingBox = entity
                .getComponent(Body)
                ?.getBoundingBox();

            if (!axisAlignedBoundingBox) {
                throw new Error("Axis aligned bounding box not found");
            }

            const neighbors = this.quadtree.getIntersectedEntities(
                axisAlignedBoundingBox
            );
            for (let i1 = 0; i1 < neighbors.length; i1++) {
                const neighbor = neighbors[i1];
                // Add the collision pair if not already added
                if (
                    neighbor !== entity &&
                    !collisionPairs.includes([entity, neighbor]) &&
                    !collisionPairs.includes([neighbor, entity])
                ) {
                    collisionPairs.push([entity, neighbor]);
                }
            }
        }
        return collisionPairs;
    }
}
