import { Entity } from "../../../core";
import { Transform } from "../../../math";
import AxisAlignedBoundingBox from "../../AxisAlignedBoundingBox";
import Body from "../../bodies/Body";
type Quadrant = Entity | Quadtree | undefined;
export default class Quadtree {
    #private;
    constructor(axisAlignedBoundingBox: AxisAlignedBoundingBox);
    addEntity(entity: Entity): void;
    removeEntity(entity: Entity, components: [Body, Transform]): void;
    private replaceWithQuadtree;
    getIntersectedEntities(range: AxisAlignedBoundingBox): Entity[];
    get quadrants(): [Quadrant, Quadrant, Quadrant, Quadrant];
    get bounds(): AxisAlignedBoundingBox;
}
export {};
