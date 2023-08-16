import { vec3 } from "ts-gl-matrix";
import Body from "./bodies/Body";
import DefaultNarrowphase from "./narrowphase/DefaultNarrowphase";
import Broadphase from "./broadphase/Broadphase";
import Collision from "./Collision";
import DefaultSolver from "./solver/DefaultSolver";
import Ray from "./Ray";
import SphereBody from "./bodies/SphereBody";
import { Component, Entity, System } from "../core";
import { Transform } from "../math";
import QuadtreeBroadphase from "./broadphase/quadtree/QuadtreeBroadphase";

export default class PhysicsSystem extends System<[Body, Transform]> {
    #broadphase: Broadphase;

    #narrowphase: DefaultNarrowphase;

    #solver: DefaultSolver;

    public constructor(tps?: number) {
        super([Body, Transform], tps);
        this.#broadphase = new QuadtreeBroadphase(
            vec3.fromValues(-10_000, -10_000, -10_000),
            vec3.fromValues(10_000, 10_000, 10_000)
        );
        this.#narrowphase = new DefaultNarrowphase();
        this.#solver = new DefaultSolver();
    }

    public onEntityEligible(
        entity: Entity,
        lastComponentAdded: Component | undefined
    ) {
        this.#broadphase.onEntityAdded(entity);
    }

    public onEntityNoLongerEligible(
        entity: Entity,
        lastComponentRemoved: Component
    ) {
        this.#broadphase.onEntityRemoved(entity);
    }

    protected onLoop(
        components: [Body, Transform][],
        entities: Entity[],
        deltaTime: number
    ): void {
        for (let i = 0; i < components.length; i++) {
            const [body, transform] = components[i];
            this.applyGravity(body, transform, deltaTime);
        }

        for (let i = 0; i < components.length; i++) {
            const [body, transform] = components[i];

            if (body.hasMoved()) {
                this.#broadphase.onEntityMoved(entities[i]);
            }
        }

        const collisionPairs = this.#broadphase.getCollisionPairs(entities);

        collisionPairs.forEach((pair) => {
            if (pair[0].id === pair[1].id) {
                throw new Error("Collision pair contains the same entity");
            }
            const entity1 = pair[0];
            const entity2 = pair[1];
            const sphereBody1 = entity1.getComponent(SphereBody);
            const sphereBody2 = entity2.getComponent(SphereBody);
            const transform1 = entity1.getComponent(Transform);
            const transform2 = entity2.getComponent(Transform);

            if (!sphereBody1 || !sphereBody2 || !transform1 || !transform2) {
                throw new Error("Body or transform not found");
            }

            // TODO: use world position
            const collisionPosition =
                this.#narrowphase.getSphereSphereCollision(
                    transform1?.position,
                    sphereBody1,
                    transform2?.position,
                    sphereBody2
                );

            if (collisionPosition) {
                this.#solver.solve(entity1, entity2, collisionPosition);

                entity1.addComponent(new Collision(collisionPosition, entity2));
                entity2.addComponent(new Collision(collisionPosition, entity1));
            }
        });
    }

    public findEntitiesFromRaycast(ray: Ray): Entity[] {
        const result: Entity[] = [];

        this.ecsManager?.entities.forEach((entity) => {
            const transform = entity.getComponent(Transform);
            const body = entity.getComponent(Body);

            if (!transform || !body) {
                return;
            }

            if (ray.getSphereIntersection(entity)) {
                result.push(entity);
            }
        });

        return result.sort((a, b) => {
            const aTransform = a.getComponent(Transform);
            const bTransform = b.getComponent(Transform);

            if (!aTransform || !bTransform) {
                throw new Error("Transform not found");
            }

            const aDistance = vec3.distance(
                ray.origin,
                aTransform.getWorldPosition()
            );
            const bDistance = vec3.distance(
                ray.origin,
                bTransform.getWorldPosition()
            );

            return aDistance - bDistance;
        });
    }

    private applyGravity(
        body: Body,
        transform: Transform,
        deltaTime: number
    ): void {
        if (!body.movable) {
            return;
        }

        if (body.movable && transform.position[1] > 0.01) {
            transform.translate([0, (-9.81 * deltaTime) / 1000, 0]);
        }

        // TODO: Use world position
        if (body.movable && transform.position[1] < 0.01) {
            transform.setPosition([
                transform.position[0],
                0,
                transform.position[2],
            ]);
        }
    }
}
