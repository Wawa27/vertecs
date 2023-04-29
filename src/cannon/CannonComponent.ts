import { Body, Material, Shape, Vec3, Quaternion, BodyType } from "cannon-es";
import { quat, vec3 } from "gl-matrix";
import { Component, Entity } from "../core";
import Transform from "../math/Transform";

export type CannonBodyOptions = {
    collisionFilterGroup?: number;
    collisionFilterMask?: number;
    collisionResponse?: boolean;
    position?: vec3;
    velocity?: vec3;
    mass?: number;
    material?: Material;
    linearDamping?: number;
    type?: BodyType;
    allowSleep?: boolean;
    sleepSpeedLimit?: number;
    sleepTimeLimit?: number;
    quaternion?: quat;
    angularVelocity?: vec3;
    fixedRotation?: boolean;
    angularDamping?: number;
    linearFactor?: vec3;
    angularFactor?: vec3;
    shape?: Shape;
    isTrigger?: boolean;
};

export default class CannonComponent extends Component {
    #body: Body;

    #isCollidingWith?: Entity;

    public constructor(options: CannonBodyOptions) {
        super();
        this.#body = new Body({
            ...options,
            position: CannonComponent.transformVec3(options.position),
            velocity: CannonComponent.transformVec3(options.velocity),
            quaternion: CannonComponent.transformQuat(options.quaternion),
            angularVelocity: CannonComponent.transformVec3(
                options.angularVelocity
            ),
            linearFactor: CannonComponent.transformVec3(options.linearFactor),
            angularFactor: CannonComponent.transformVec3(options.angularFactor),
        });
    }

    public onAddedToEntity(entity: Entity): void {
        const transform = entity.getComponent(Transform);
        if (transform) {
            this.#body.position.set(
                transform.position[0],
                transform.position[1],
                transform.position[2]
            );
        }
        // @ts-ignore
        this.#body.entityId = entity.id;
    }

    private static transformVec3(vec3?: vec3): Vec3 {
        if (!vec3) {
            return new Vec3();
        }
        return new Vec3().set(vec3[0], vec3[1], vec3[2]);
    }

    private static transformQuat(quat?: quat): Quaternion {
        if (!quat) {
            return new Quaternion();
        }
        return new Quaternion().set(quat[0], quat[1], quat[2], quat[3]);
    }

    public get body(): Body {
        return this.#body;
    }

    public set body(value: Body) {
        this.#body = value;
    }

    public get isCollidingWith(): Entity | undefined {
        return this.#isCollidingWith;
    }

    public set isCollidingWith(value: Entity | undefined) {
        this.#isCollidingWith = value;
    }
}
