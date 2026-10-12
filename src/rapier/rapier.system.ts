import RAPIER, {
    ColliderDesc,
    EventQueue,
    RigidBodyDesc,
    TempContactForceEvent,
    World,
} from "@dimforge/rapier3d-compat";
import { quat, vec3 } from "ts-gl-matrix";
import { Entity, System } from "../core";
import { Transform } from "../math";
import RapierComponent, { RapierComponentOptions } from "./rapier.component";

let initialization: Promise<void> | undefined;
const TIMESTEP = 1 / 60;

type ContactForceListener = (
    collider1: number,
    collider2: number,
    forceMagnitude: number
) => void;

function createCollider(options: RapierComponentOptions): ColliderDesc {
    if (
        options.type !== "trimesh" &&
        !options.size.every((value) => Number.isFinite(value) && value > 0)
    ) {
        throw new Error("Collider dimensions must be finite and positive");
    }
    switch (options.type) {
        case "box":
            return ColliderDesc.cuboid(
                options.size[0] / 2,
                options.size[1] / 2,
                options.size[2] / 2
            );
        case "sphere":
            return ColliderDesc.ball(options.size[0]);
        case "trimesh":
            if (options.bodyType && options.bodyType !== "fixed") {
                throw new Error(
                    "Triangle meshes require a fixed body; use a convex hull for dynamic bodies"
                );
            }
            return ColliderDesc.trimesh(
                options.vertices,
                options.indices,
                RAPIER.TriMeshFlags.FIX_INTERNAL_EDGES
            );
        case "cylinder": {
            const [radius, height] = options.size;
            const sides = options.cylinderSides;
            if (sides === undefined)
                return ColliderDesc.cylinder(height / 2, radius);
            if (!Number.isInteger(sides) || sides < 3) {
                throw new Error(
                    "Faceted cylinders require at least three sides"
                );
            }
            const vertices = new Float32Array(sides * 6);
            for (let index = 0; index < sides * 2; index++) {
                const angle = ((index % sides) * Math.PI * 2) / sides;
                vertices.set(
                    [
                        Math.sin(angle) * radius,
                        index < sides ? -height / 2 : height / 2,
                        Math.cos(angle) * radius,
                    ],
                    index * 3
                );
            }
            const collider = ColliderDesc.convexHull(vertices);
            if (!collider)
                throw new Error("Unable to create cylinder convex hull");
            return collider;
        }
        default:
            throw new Error("Unsupported Rapier collider");
    }
}

export default class RapierSystem extends System<[RapierComponent, Transform]> {
    #world?: World;

    #eventQueue?: EventQueue;

    readonly #contactForceListeners = new Set<ContactForceListener>();

    readonly #dispatchContactForce = (event: TempContactForceEvent): void => {
        const collider1 = event.collider1();
        const collider2 = event.collider2();
        const forceMagnitude = event.totalForceMagnitude();
        this.#contactForceListeners.forEach((listener) =>
            listener(collider1, collider2, forceMagnitude)
        );
    };

    readonly #components = new Set<RapierComponent>();

    #accumulator = 0;

    readonly #position = vec3.create();

    readonly #rotation = quat.create();

    public constructor(
        tps?: number,
        private readonly options: {
            maxCcdSubsteps?: number;
            numSolverIterations?: number;
            numInternalPgsIterations?: number;
        } = {}
    ) {
        super([RapierComponent, Transform], tps);
        const maxCcdSubsteps = options.maxCcdSubsteps ?? 1;
        if (!Number.isInteger(maxCcdSubsteps) || maxCcdSubsteps < 0)
            throw new RangeError("CCD substeps must be a non-negative integer");
        [options.numSolverIterations, options.numInternalPgsIterations].forEach(
            (count) => {
                if (
                    count !== undefined &&
                    (!Number.isInteger(count) || count < 1)
                )
                    throw new RangeError(
                        "Solver iterations must be a positive integer"
                    );
            }
        );
    }

    public get world(): World | undefined {
        return this.#world;
    }

    /** Called immediately after each fixed physics step. Returns an unsubscribe function. */
    public onContactForce(listener: ContactForceListener): () => void {
        this.#contactForceListeners.add(listener);
        return () => {
            this.#contactForceListeners.delete(listener);
        };
    }

    public override async onStart(): Promise<void> {
        initialization ??= RAPIER.init();
        await initialization;
        this.#world = new World({ x: 0, y: -9.81, z: 0 });
        this.#eventQueue = new EventQueue(true);
        this.#world.timestep = TIMESTEP;
        this.#world.integrationParameters.maxCcdSubsteps =
            this.options.maxCcdSubsteps ?? 1;
        if (this.options.numSolverIterations !== undefined)
            this.#world.integrationParameters.numSolverIterations =
                this.options.numSolverIterations;
        if (this.options.numInternalPgsIterations !== undefined)
            this.#world.integrationParameters.numInternalPgsIterations =
                this.options.numInternalPgsIterations;
        this.#accumulator = 0;
        this.lastUpdateTime = performance.now();
        // Recreate bodies when a stopped system is started again.
        this.ecsManager?.entities.forEach((entity) => {
            const physics = entity.getComponent(RapierComponent);
            const transform = entity.getComponent(Transform);
            if (physics && transform)
                this.onEntityEligible(entity, [physics, transform]);
        });
    }

    public override onEntityEligible(
        _entity: Entity,
        [physics, transform]: [RapierComponent, Transform]
    ): void {
        if (!this.#world || this.#components.has(physics)) return;
        const options = physics.bodyOptions;
        const collider = createCollider(options)
            .setDensity(options.density ?? 1)
            .setFriction(options.friction ?? 0.5)
            .setRestitution(options.restitution ?? 0);
        if (options.colliderOffset)
            collider.setTranslation(...options.colliderOffset);
        if (options.collisionGroups !== undefined)
            collider.setCollisionGroups(options.collisionGroups);
        if (options.contactForceEvents)
            collider
                .setActiveEvents(RAPIER.ActiveEvents.CONTACT_FORCE_EVENTS)
                .setContactForceEventThreshold(0);
        let desc = RigidBodyDesc.fixed();
        if (options.bodyType === "dynamic") desc = RigidBodyDesc.dynamic();
        if (options.bodyType === "kinematic")
            desc = RigidBodyDesc.kinematicPositionBased();
        const position = transform.getWorldPosition();
        const rotation = transform.getWorldRotation();
        desc.setTranslation(position[0], position[1], position[2])
            .setRotation({
                x: rotation[0],
                y: rotation[1],
                z: rotation[2],
                w: rotation[3],
            })
            .setCcdEnabled(options.ccd ?? false)
            .setLinearDamping(options.linearDamping ?? 0)
            .setAngularDamping(options.angularDamping ?? 0);
        if (options.disableRotation) desc.lockRotations();
        const body = this.#world.createRigidBody(desc);
        try {
            this.#world.createCollider(collider, body);
        } catch (error) {
            this.#world.removeRigidBody(body);
            throw error;
        }
        physics.body = body;
        this.#components.add(physics);
    }

    public override onEntityNoLongerEligible(
        _entity: Entity,
        [physics]: [RapierComponent, Transform]
    ): void {
        if (physics.body && this.#components.delete(physics))
            this.#world?.removeRigidBody(physics.body);
        physics.body = undefined;
    }

    public override async onStop(): Promise<void> {
        this.#components.forEach((physics) => {
            physics.body = undefined;
        });
        this.#components.clear();
        this.#eventQueue?.free();
        this.#eventQueue = undefined;
        this.#contactForceListeners.clear();
        this.#world?.free();
        this.#world = undefined;
        this.#accumulator = 0;
    }

    protected override onLoop(
        components: [RapierComponent, Transform][],
        _entities: Entity[],
        deltaTime: number
    ): void {
        if (!this.#world || !this.#eventQueue) return;
        // Fixed steps preserve simulation speed across rendering rates; cap catch-up after a stalled tab.
        this.#accumulator += Math.min(Math.max(deltaTime, 0), 100) / 1000;
        while (this.#accumulator + 1e-8 >= TIMESTEP) {
            this.#world.step(this.#eventQueue);
            this.#eventQueue.drainContactForceEvents(
                this.#dispatchContactForce
            );
            this.#accumulator -= TIMESTEP;
        }
        for (let index = 0; index < components.length; index++) {
            const [physics, transform] = components[index];
            const { body } = physics;
            if (!body) throw new Error("Rapier body not found");
            const position = body.translation();
            const rotation = body.rotation();
            vec3.set(this.#position, position.x, position.y, position.z);
            quat.set(
                this.#rotation,
                rotation.x,
                rotation.y,
                rotation.z,
                rotation.w
            );
            if (transform.parent) {
                vec3.transformMat4(
                    this.#position,
                    this.#position,
                    transform.parent.getWorldToModelMatrix()
                );
                quat.invert(
                    this.#rotation,
                    transform.parent.getWorldRotation()
                );
                quat.multiply(this.#rotation, this.#rotation, [
                    rotation.x,
                    rotation.y,
                    rotation.z,
                    rotation.w,
                ]);
            }
            transform.setPosition(this.#position);
            transform.setRotationQuat(this.#rotation);
        }
    }
}
