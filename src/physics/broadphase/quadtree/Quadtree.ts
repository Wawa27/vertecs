import { vec3 } from "ts-gl-matrix";
import { Entity } from "../../../core";
import { Transform } from "../../../math";
import AxisAlignedBoundingBox from "../../AxisAlignedBoundingBox";
import Body from "../../bodies/Body";

type Quadrant = Entity | Quadtree | undefined;

export default class Quadtree {
    #quadrants: [Quadrant, Quadrant, Quadrant, Quadrant] = [
        undefined,
        undefined,
        undefined,
        undefined,
    ];

    #bounds: AxisAlignedBoundingBox;

    constructor(axisAlignedBoundingBox: AxisAlignedBoundingBox) {
        this.#bounds = axisAlignedBoundingBox;
    }

    public addEntity(entity: Entity): void {
        const transform = entity.getComponent(Transform);

        if (!transform) {
            throw new Error("Transform not found");
        }

        const worldPosition = transform.getWorldPosition();

        if (!this.#bounds.contains(worldPosition)) {
            console.warn("Tried to add entity outside of quadtree bounds");
            return;
        }

        const quadrantIndex = this.getEntityQuadrantIndex(entity);
        const quadrant = this.#quadrants[quadrantIndex];

        if (!quadrant) {
            this.#quadrants[quadrantIndex] = entity;
        } else if (quadrant instanceof Entity) {
            if (quadrant === entity) {
                console.warn("Tried to add the same entity twice");
                return;
            }
            const quadtree = this.replaceWithQuadtree(quadrantIndex);
            quadtree.addEntity(entity);
        } else {
            quadrant.addEntity(entity);
        }
    }

    public removeEntity(entity: Entity, components: [Body, Transform]): void {
        const [body, transform] = components;

        const worldPosition = transform.getWorldPosition();

        if (!this.#bounds.contains(worldPosition)) {
            console.warn("Tried to remove entity outside of quadtree bounds");
            return;
        }

        const halfWidth =
            (this.#bounds.maximum[0] - this.#bounds.minimum[0]) / 2;
        const halfHeight =
            (this.#bounds.maximum[1] - this.#bounds.minimum[1]) / 2;

        const quadrantIndex =
            (worldPosition[0] > this.#bounds.minimum[0] + halfWidth ? 1 : 0) +
            (worldPosition[1] > this.#bounds.minimum[1] + halfHeight ? 2 : 0);

        const quadrant = this.#quadrants[quadrantIndex];

        if (quadrant instanceof Entity) {
            this.#quadrants[quadrantIndex] = undefined;
        } else if (quadrant instanceof Quadtree) {
            quadrant.removeEntity(entity, components);
        }
    }

    private replaceWithQuadtree(index: number): Quadtree {
        const entity = this.#quadrants[index] as Entity;

        const halfWidth =
            (this.#bounds.maximum[0] - this.#bounds.minimum[0]) / 2;
        const halfHeight =
            (this.#bounds.maximum[1] - this.#bounds.minimum[1]) / 2;

        const quadrantBounds = new AxisAlignedBoundingBox(
            vec3.fromValues(
                this.#bounds.minimum[0] + (index % 2) * halfWidth,
                this.#bounds.minimum[1] + Math.floor(index / 2) * halfHeight,
                this.#bounds.minimum[2]
            ),
            vec3.fromValues(
                this.#bounds.minimum[0] + ((index % 2) + 1) * halfWidth,
                this.#bounds.minimum[1] +
                    (Math.floor(index / 2) + 1) * halfHeight,
                this.#bounds.maximum[2]
            )
        );

        const quadtree = new Quadtree(quadrantBounds);
        this.#quadrants[index] = quadtree;
        quadtree.addEntity(entity);

        return quadtree;
    }

    public getIntersectedEntities(range: AxisAlignedBoundingBox): Entity[] {
        let found: Entity[] = [];

        if (!this.#bounds.intersects(range)) {
            return found;
        }

        for (let i = 0; i < this.#quadrants.length; i++) {
            const quadrant = this.#quadrants[i];
            if (quadrant instanceof Entity) {
                const body = quadrant.getComponent(Body);
                if (!body) {
                    console.warn("Entity has no body", quadrant);
                    break;
                }
                if (range.intersects(body.getBoundingBox())) {
                    found.push(quadrant);
                }
            } else if (quadrant instanceof Quadtree) {
                found = found.concat(quadrant.getIntersectedEntities(range));
            }
        }

        return found;
    }

    public getEntityQuadrantIndex(entity: Entity): number {
        const entityWorldPosition = entity
            .getComponent(Transform)
            ?.getWorldPosition();

        if (!entityWorldPosition) {
            throw new Error("Entity has no transform");
        }

        const halfWidth =
            (this.#bounds.maximum[0] - this.#bounds.minimum[0]) / 2;
        const halfHeight =
            (this.#bounds.maximum[1] - this.#bounds.minimum[1]) / 2;

        return (
            (entityWorldPosition[0] > this.#bounds.minimum[0] + halfWidth
                ? 1
                : 0) +
            (entityWorldPosition[1] > this.#bounds.minimum[1] + halfHeight
                ? 2
                : 0)
        );
    }

    public get quadrants(): [Quadrant, Quadrant, Quadrant, Quadrant] {
        return this.#quadrants;
    }

    public get bounds(): AxisAlignedBoundingBox {
        return this.#bounds;
    }
}
