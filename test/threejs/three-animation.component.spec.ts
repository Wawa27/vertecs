import { assert } from "chai";
import {
    AnimationClip,
    Object3D,
    QuaternionKeyframeTrack,
    VectorKeyframeTrack,
} from "three";
import { Entity } from "../../src/core";
import ThreeAnimationComponent from "../../src/threejs/three-animation.component";
import ThreeObject3DComponent from "../../src/threejs/three-object3D.component";

describe("ThreeAnimationComponent", () => {
    it("plays masked layers from existing clips at the requested time", () => {
        const root = new Object3D();
        const pelvis = new Object3D();
        pelvis.name = "Pelvis";
        const spine = new Object3D();
        spine.name = "spine_01";
        root.add(pelvis, spine);
        root.animations = [
            new AnimationClip("Run", 1, [
                new VectorKeyframeTrack(
                    "Pelvis.position",
                    [0, 1],
                    [0, 0, 0, 1, 0, 0]
                ),
                new QuaternionKeyframeTrack(
                    "spine_01.quaternion",
                    [0, 1],
                    [0, 0, 0, 1, 0, 0, 0, 1]
                ),
            ]),
            new AnimationClip("Chop", 1, [
                new VectorKeyframeTrack(
                    "Pelvis.position",
                    [0, 1],
                    [0, 0, 0, 0, 0, 0]
                ),
                new QuaternionKeyframeTrack(
                    "spine_01.quaternion",
                    [0, 1],
                    [0, 0, 0, 1, 0, 0, 1, 0]
                ),
            ]),
        ];

        const entity = new Entity();
        entity.addComponent(new ThreeObject3DComponent(root));
        const animation = new ThreeAnimationComponent();
        entity.addComponent(animation);

        animation.playAnimationLayers(
            [
                {
                    name: "run-lower",
                    animationName: "Run",
                    trackFilter: (trackName) => trackName.startsWith("Pelvis."),
                },
                {
                    name: "chop-upper",
                    animationName: "Chop",
                    trackFilter: (trackName) =>
                        trackName.startsWith("spine_01."),
                },
            ],
            0.25
        );

        const layers = animation.currentAnimation!;
        assert.lengthOf(layers, 2);
        assert.deepEqual(
            layers.map((action) => action.getClip().tracks[0].name),
            ["Pelvis.position", "spine_01.quaternion"]
        );
        assert.deepEqual(
            layers.map((action) => action.time),
            [0.25, 0.25]
        );

        animation.playAnimation("Chop", 0.5);
        assert.lengthOf(animation.currentAnimation!, 1);
        assert.equal(animation.currentAnimation![0].getClip().name, "Chop");
        assert.equal(animation.currentAnimation![0].time, 0.5);
    });
});
