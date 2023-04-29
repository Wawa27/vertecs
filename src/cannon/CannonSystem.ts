import {
    Material,
    Vec3,
    World,
    GSSolver,
    SplitSolver,
    NaiveBroadphase,
    ContactMaterial,
    RaycastResult,
    Body,
} from "cannon-es";
import { vec3 } from "gl-matrix";
import CannonComponent from "./CannonComponent";
import Transform from "../math/Transform";
import { Component, Entity, System } from "../core";

export default class CannonSystem extends System {
    public static world: World;

    public constructor() {
        super([Transform, CannonComponent], 100);

        CannonSystem.world = new World();
    }

    public async onStart(): Promise<void> {
        CannonSystem.world.quatNormalizeSkip = 0;
        CannonSystem.world.quatNormalizeFast = false;

        const solver = new GSSolver();

        CannonSystem.world.defaultContactMaterial.contactEquationStiffness = 1e9;
        CannonSystem.world.defaultContactMaterial.contactEquationRelaxation = 4;

        solver.iterations = 7;
        solver.tolerance = 0.1;
        const split = true;
        if (split) {
            CannonSystem.world.solver = new SplitSolver(solver);
        } else {
            CannonSystem.world.solver = solver;
        }

        CannonSystem.world.gravity.set(0, -10, 0);
        CannonSystem.world.broadphase = new NaiveBroadphase();

        const physicsMaterial = new Material("slipperyMaterial");
        const physicsContactMaterial = new ContactMaterial(
            physicsMaterial,
            physicsMaterial,
            {
                friction: 0.0,
                restitution: 0.3,
            }
        );
        CannonSystem.world.addContactMaterial(physicsContactMaterial);
    }

    public getRaycastedEntities(
        position: vec3,
        direction: vec3,
        collisionFilterMask = -1
    ): Entity | undefined {
        const fromVec3 = new Vec3(
            position[0] + direction[0],
            position[1] + direction[1],
            position[2] + direction[2]
        );
        const toVec3 = new Vec3(
            position[0] + direction[0] * 20,
            position[1] + direction[1] * 20,
            position[2] + direction[2] * 20
        );

        const result = new RaycastResult();
        CannonSystem.world.raycastClosest(
            fromVec3,
            toVec3,
            { collisionFilterMask },
            result
        );

        // @ts-ignore
        const entityId = result.body?.entityId;

        if (!entityId || !this.ecsManager) {
            return undefined;
        }

        const closestEntity = Entity.findById(this.ecsManager, entityId);
        if (result.body && closestEntity) {
            return closestEntity;
        }

        return undefined;
    }

    public onEntityEligible(
        entity: Entity,
        lastComponentAdded?: Component
    ): void {
        const cannonComponent = entity.getComponent(CannonComponent);
        const body = cannonComponent?.body;
        if (!body) {
            throw new Error("Body not found on cannon component");
        }

        body.addEventListener("collide", (event: any) => {
            cannonComponent.isCollidingWith = event.body.entity;
        });
        CannonSystem.world.addBody(body);
    }

    public onEntityNoLongerEligible(
        entity: Entity,
        lastComponentRemoved: Component
    ) {
        const cannonBody =
            entity.getComponent(CannonComponent) ??
            (lastComponentRemoved as CannonComponent);
        CannonSystem.world.removeBody(cannonBody.body);
    }

    protected onLoop(entities: Entity[], deltaTime: number): void {
        CannonSystem.world?.step(1 / 60);

        entities.forEach((entity) => {
            const transform = entity.getComponent(Transform);
            const cannonBody = entity.getComponent(CannonComponent);

            if (!transform || !cannonBody) {
                throw new Error(
                    `Transform or cannon body not found on eligible entity : ${entity.id}`
                );
            }

            transform.position[0] = cannonBody.body.position.x;
            transform.position[1] = cannonBody.body.position.y;
            transform.position[2] = cannonBody.body.position.z;

            transform.rotation[0] = cannonBody.body.quaternion.x;
            transform.rotation[1] = cannonBody.body.quaternion.y;
            transform.rotation[2] = cannonBody.body.quaternion.z;
            transform.rotation[3] = cannonBody.body.quaternion.w;
        });
    }
}
