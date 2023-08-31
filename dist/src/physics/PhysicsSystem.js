import { vec3 } from "ts-gl-matrix";
import Body from "./bodies/Body";
import DefaultNarrowphase from "./narrowphase/DefaultNarrowphase";
import Collision from "./Collision";
import DefaultSolver from "./solver/DefaultSolver";
import SphereBody from "./bodies/SphereBody";
import { System } from "../core";
import { Transform } from "../math";
import BruteForceBroadphase from "./broadphase/BruteForceBroadphase";
export default class PhysicsSystem extends System {
    #broadphase;
    #narrowphase;
    #solver;
    constructor(tps) {
        super([Body, Transform], tps);
        this.#broadphase = new BruteForceBroadphase();
        this.#narrowphase = new DefaultNarrowphase();
        this.#solver = new DefaultSolver();
    }
    onEntityEligible(entity, components) {
        this.#broadphase.onEntityAdded(entity, components);
    }
    onEntityNoLongerEligible(entity, components) {
        this.#broadphase.onEntityRemoved(entity, components);
    }
    onLoop(components, entities, deltaTime) {
        for (let i = 0; i < components.length; i++) {
            const [body, transform] = components[i];
            this.applyGravity(body, transform, deltaTime);
        }
        for (let i = 0; i < components.length; i++) {
            const [body, transform] = components[i];
            if (body.hasMoved()) {
                this.#broadphase.onEntityMoved(entities[i], components[i]);
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
            const collisionPosition = this.#narrowphase.getSphereSphereCollision(transform1?.position, sphereBody1, transform2?.position, sphereBody2);
            if (collisionPosition) {
                this.#solver.solve(entity1, entity2, collisionPosition);
                entity1.addComponent(new Collision(collisionPosition, entity2));
                entity2.addComponent(new Collision(collisionPosition, entity1));
            }
        });
    }
    findEntitiesFromRaycast(ray) {
        const result = [];
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
            const aDistance = vec3.distance(ray.origin, aTransform.getWorldPosition());
            const bDistance = vec3.distance(ray.origin, bTransform.getWorldPosition());
            return aDistance - bDistance;
        });
    }
    applyGravity(body, transform, deltaTime) {
        if (!body.movable || body.mass === 0) {
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
