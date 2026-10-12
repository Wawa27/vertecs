import { assert } from "chai";
import { Quaternion, Vector3 } from "three";
import {
    EcsManager,
    Entity,
    RapierComponent,
    RapierSystem,
    Transform,
} from "../../src";

function step(
    system: RapierSystem,
    entity: Entity,
    count: number,
    delta = 1000 / 60
): void {
    for (let index = 0; index < count; index++) {
        system.lastUpdateTime = performance.now() - delta;
        system.loop(
            [
                [
                    entity.getComponent(RapierComponent)!,
                    entity.getComponent(Transform)!,
                ],
            ],
            [entity]
        );
    }
}

describe("RapierSystem", () => {
    [undefined, 4].forEach((maxCcdSubsteps) => {
        it(`preserves CCD substeps ${maxCcdSubsteps ?? 1} and the fixed timestep after restart`, async () => {
            const ecs = new EcsManager();
            const options =
                maxCcdSubsteps === undefined
                    ? {}
                    : {
                          maxCcdSubsteps,
                          numSolverIterations: 1,
                          numInternalPgsIterations: 4,
                      };
            const system = new RapierSystem(60, options);
            try {
                await system.start(ecs);
                assert.equal(
                    system.world!.integrationParameters.maxCcdSubsteps,
                    maxCcdSubsteps ?? 1
                );
                assert.closeTo(system.world!.timestep, 1 / 60, 1e-8);
                assert.equal(
                    system.world!.integrationParameters.numSolverIterations,
                    options.numSolverIterations ?? 4
                );
                assert.equal(
                    system.world!.integrationParameters
                        .numInternalPgsIterations,
                    options.numInternalPgsIterations ?? 1
                );
                await system.stop();
                await system.start(ecs);
                assert.equal(
                    system.world!.integrationParameters.maxCcdSubsteps,
                    maxCcdSubsteps ?? 1
                );
                assert.equal(
                    system.world!.integrationParameters.numSolverIterations,
                    options.numSolverIterations ?? 4
                );
                assert.equal(
                    system.world!.integrationParameters
                        .numInternalPgsIterations,
                    options.numInternalPgsIterations ?? 1
                );
            } finally {
                await system.stop();
            }
        });
    });

    it("rejects invalid CCD substep counts", () => {
        [-1, 1.5, NaN, Infinity].forEach((maxCcdSubsteps) =>
            assert.throws(
                () => new RapierSystem(60, { maxCcdSubsteps }),
                RangeError
            )
        );
    });

    it("rejects invalid solver iteration counts", () => {
        [0, -1, 1.5, NaN, Infinity].forEach((count) => {
            assert.throws(
                () => new RapierSystem(60, { numSolverIterations: count }),
                RangeError
            );
            assert.throws(
                () => new RapierSystem(60, { numInternalPgsIterations: count }),
                RangeError
            );
        });
    });

    it("dispatches contact forces during catch-up steps and supports unsubscribing", async () => {
        const ecs = new EcsManager();
        const system = new RapierSystem();
        await ecs.addSystem(system);
        const ground = ecs.createEntity({
            components: [
                new Transform([0, -1, 0]),
                new RapierComponent({ type: "box", size: [20, 2, 20] }),
            ],
        });
        const entity = ecs.createEntity({
            components: [
                new Transform([0, 0.51, 0]),
                new RapierComponent({
                    type: "sphere",
                    size: [0.5],
                    bodyType: "dynamic",
                    contactForceEvents: true,
                }),
            ],
        });
        const handles = [ground, entity].map(
            (e) => e.getComponent(RapierComponent)!.body!.collider(0).handle
        );
        let events = 0;
        const unsubscribe = system.onContactForce(
            (collider1, collider2, force) => {
                assert.sameMembers([collider1, collider2], handles);
                assert.isAbove(force, 0);
                events++;
            }
        );
        try {
            step(system, entity, 1, 100);
            assert.isAbove(
                events,
                1,
                "drain events from every catch-up step, not just the last"
            );
            const before = events;
            unsubscribe();
            step(system, entity, 60);
            assert.equal(events, before);
            await system.stop();
            await system.start(ecs);
            let restartedEvents = 0;
            system.onContactForce(() => {
                restartedEvents++;
            });
            step(system, entity, 60);
            assert.isAbove(restartedEvents, 0);
            assert.equal(events, before);
        } finally {
            unsubscribe();
            await system.stop();
        }
    });

    it("offsets a collider and its center of mass without moving the body origin", async () => {
        const ecs = new EcsManager();
        const system = new RapierSystem();
        await ecs.addSystem(system);
        const physics = new RapierComponent({
            type: "box",
            size: [2, 4, 2],
            bodyType: "dynamic",
            colliderOffset: [0, 1, 0],
        });
        ecs.createEntity({ components: [new Transform([0, 10, 0]), physics] });
        try {
            assert.equal(physics.body!.translation().y, 10);
            assert.equal(physics.body!.collider(0).translation().y, 11);
            assert.equal(physics.body!.localCom().y, 1);
            assert.equal(physics.body!.mass(), 16);
        } finally {
            await system.stop();
        }
    });
    it("initializes asynchronously and supports boxes, spheres, friction, and fixed ground", async () => {
        const ecs = new EcsManager();
        const system = new RapierSystem();
        const sphere = ecs.createEntity({
            components: [
                new Transform([0, 5, 0]),
                new RapierComponent({
                    type: "sphere",
                    size: [1],
                    bodyType: "dynamic",
                    density: 2,
                    friction: 0.9,
                    restitution: 0,
                }),
            ],
        });
        await ecs.addSystem(system);
        const ground = ecs.createEntity({
            components: [
                new Transform([0, -1, 0]),
                new RapierComponent({ type: "box", size: [100, 2, 100] }),
            ],
        });
        try {
            step(system, sphere, 240);
            const body = sphere.getComponent(RapierComponent)!.body!;
            assert.closeTo(body.translation().y, 1, 0.02);
            assert.closeTo(body.mass(), (8 * Math.PI) / 3, 0.001);
            assert.equal(body.collider(0).friction(), Math.fround(0.9));
            assert.equal(
                ground.getComponent(RapierComponent)!.body!.translation().y,
                -1
            );
            assert.isTrue(body.isSleeping());
        } finally {
            await system.stop();
        }
    });

    it("uses elapsed time for fixed stepping at different render rates and caps stalled frames", async () => {
        const simulate = async (
            frames: number,
            delta: number
        ): Promise<number> => {
            const ecs = new EcsManager();
            const system = new RapierSystem();
            await ecs.addSystem(system);
            const entity = ecs.createEntity({
                components: [
                    new Transform([0, 20, 0]),
                    new RapierComponent({
                        type: "box",
                        size: [1, 1, 1],
                        bodyType: "dynamic",
                    }),
                ],
            });
            try {
                step(system, entity, frames, delta);
                return entity.getComponent(RapierComponent)!.body!.translation()
                    .y;
            } finally {
                await system.stop();
            }
        };
        assert.closeTo(
            await simulate(30, 1000 / 30),
            await simulate(120, 1000 / 120),
            0.01
        );
        assert.isAbove(await simulate(1, 60_000), 19.9);
    });

    it("creates one native six-sided hull with the correct mass and lets it settle on a face", async () => {
        const ecs = new EcsManager();
        const system = new RapierSystem();
        await ecs.addSystem(system);
        ecs.createEntity({
            components: [
                new Transform([0, -1, 0]),
                new RapierComponent({
                    type: "box",
                    size: [100, 2, 100],
                    friction: 0.9,
                }),
            ],
        });
        const rotation = new Quaternion()
            .setFromAxisAngle(new Vector3(1, 0, 0), Math.PI / 2)
            .multiply(
                new Quaternion().setFromAxisAngle(
                    new Vector3(0, 1, 0),
                    Math.PI / 6
                )
            );
        const entity = ecs.createEntity({
            components: [
                new Transform(
                    [0, Math.cos(Math.PI / 6), 0],
                    rotation.toArray()
                ),
                new RapierComponent({
                    type: "cylinder",
                    size: [1, 8],
                    cylinderSides: 6,
                    bodyType: "dynamic",
                    density: 0.5,
                    friction: 0.9,
                }),
            ],
        });
        const body = entity.getComponent(RapierComponent)!.body!;
        try {
            assert.equal(body.numColliders(), 1);
            assert.closeTo(body.mass(), 6 * Math.sqrt(3), 0.001);
            body.setAngvel({ x: 0, y: 0, z: 0.5 }, true);
            body.setLinvel({ x: -0.5, y: 0, z: 0 }, true);
            step(system, entity, 300);
            assert.isBelow(Math.abs(body.translation().x), 0.75);
            assert.closeTo(body.angvel().z, 0, 0.01);
        } finally {
            await system.stop();
        }
    });

    it("locks rotation while retaining translation and accepts impulses", async () => {
        const ecs = new EcsManager();
        const system = new RapierSystem();
        await ecs.addSystem(system);
        const entity = ecs.createEntity({
            components: [
                new Transform([0, 10, 0]),
                new RapierComponent({
                    type: "box",
                    size: [1, 1, 1],
                    bodyType: "dynamic",
                    disableRotation: true,
                }),
            ],
        });
        const body = entity.getComponent(RapierComponent)!.body!;
        try {
            body.applyImpulse({ x: 1, y: 0, z: 0 }, true);
            body.applyTorqueImpulse({ x: 10, y: 20, z: 30 }, true);
            step(system, entity, 30);
            assert.isAbove(body.translation().x, 0.4);
            assert.isBelow(body.translation().y, 10);
            assert.deepEqual(body.rotation(), { x: 0, y: 0, z: 0, w: 1 });
        } finally {
            await system.stop();
        }
    });

    it("synchronizes world poses through rotated and scaled parents", async () => {
        const ecs = new EcsManager();
        const system = new RapierSystem();
        await ecs.addSystem(system);
        const parent = new Entity({
            components: [
                new Transform(
                    [5, 6, 7],
                    new Quaternion()
                        .setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 2)
                        .toArray(),
                    [2, 2, 2]
                ),
            ],
        });
        const transform = new Transform([1, 2, 3]);
        const physics = new RapierComponent({ type: "box", size: [1, 1, 1] });
        const child = new Entity({ components: [transform, physics] });
        parent.addChild(child);
        ecs.addEntity(parent);
        try {
            const expectedPosition = Array.from(transform.getWorldPosition());
            const expectedRotation = Array.from(transform.getWorldRotation());
            step(system, child, 2);
            Array.from(transform.getWorldPosition()).forEach((value, index) =>
                assert.closeTo(value, expectedPosition[index], 0.0001)
            );
            Array.from(transform.getWorldRotation()).forEach((value, index) =>
                assert.closeTo(value, expectedRotation[index], 0.0001)
            );
        } finally {
            await system.stop();
        }
    });

    it("supports fixed terrain triangle meshes", async () => {
        const ecs = new EcsManager();
        const system = new RapierSystem();
        await ecs.addSystem(system);
        ecs.createEntity({
            components: [
                new Transform(),
                new RapierComponent({
                    type: "trimesh",
                    vertices: new Float32Array([
                        -10, 0, -10, 10, 0, -10, 10, 0, 10, -10, 0, 10,
                    ]),
                    indices: new Uint32Array([0, 2, 1, 0, 3, 2]),
                }),
            ],
        });
        const entity = ecs.createEntity({
            components: [
                new Transform([0, 3, 0]),
                new RapierComponent({
                    type: "sphere",
                    size: [0.5],
                    bodyType: "dynamic",
                    ccd: true,
                }),
            ],
        });
        try {
            step(system, entity, 120);
            assert.closeTo(
                entity.getComponent(Transform)!.position[1],
                0.5,
                0.02
            );
        } finally {
            await system.stop();
        }
    });

    it("removes bodies and colliders on component removal, destruction, stop, and restart", async () => {
        const ecs = new EcsManager();
        const system = new RapierSystem();
        await ecs.addSystem(system);
        const physics = new RapierComponent({
            type: "cylinder",
            size: [1, 4],
            bodyType: "dynamic",
        });
        const entity = ecs.createEntity({
            components: [new Transform(), physics],
        });
        const oldBody = physics.body!;
        const clone = physics.clone();
        assert.isUndefined(clone.body);
        entity.removeComponent(RapierComponent);
        assert.isUndefined(physics.body);
        assert.isFalse(oldBody.isValid());
        entity.addComponent(physics);
        await system.stop();
        assert.isUndefined(system.world);
        assert.isUndefined(physics.body);
        await system.start(ecs);
        assert.isDefined(physics.body);
        entity.destroy();
        assert.isUndefined(physics.body);
        let colliders = 0;
        system.world!.forEachCollider(() => {
            colliders++;
        });
        assert.equal(colliders, 0);
        await system.stop();
    });
});
