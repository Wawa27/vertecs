import { expect } from "chai";
import { Entity, NetworkTransform, Transform } from "../../src";

describe("NetworkTransform", () => {
    it("replays unacknowledged movement after an authoritative correction", () => {
        const entity = new Entity();
        const networkTransform = new NetworkTransform();
        entity.addComponent(networkTransform);

        networkTransform.reconcile(
            {
                className: "NetworkTransform",
                data: {
                    position: [0.5, 0, 0],
                    rotation: [0, 0, 0, 1],
                    scale: [1, 1, 1],
                },
                updateTimestamp: -1,
            },
            [
                {
                    previousData: {
                        position: [1, 0, 0],
                        rotation: [0, 0, 0, 1],
                        scale: [1, 1, 1],
                    },
                    data: {
                        position: [2, 0, 0],
                        rotation: [0, 0, 0, 1],
                        scale: [1, 1, 1],
                    },
                },
            ]
        );

        expect(
            Array.from(entity.getComponent(Transform)!.getWorldPosition())
        ).to.deep.equal([1.5, 0, 0]);
        expect(networkTransform.isDirty(networkTransform.lastData!)).to.equal(
            false
        );
    });

    it("does not mutate received data or become dirty after deserialization", () => {
        const entity = new Entity();
        const networkTransform = new NetworkTransform();
        entity.addComponent(networkTransform);
        const serialized = {
            className: "NetworkTransform",
            data: {
                position: [2, 3, 4] as [number, number, number],
                rotation: [0, 0, 0, 1] as [number, number, number, number],
                scale: [5, 5, 5] as [number, number, number],
            },
            updateTimestamp: 1,
        };

        networkTransform.deserialize(serialized);

        expect(serialized.data.position).to.deep.equal([2, 3, 4]);
        expect(networkTransform.isDirty(serialized.data)).to.equal(false);
    });

    it("ignores floating-point transform drift", () => {
        const entity = new Entity();
        const networkTransform = new NetworkTransform();
        entity.addComponent(networkTransform);
        const transform = entity.getComponent(Transform)!;
        const lastData = networkTransform.write();

        transform.setScale([1.0000005, 1, 0.9999995]);
        transform.setRotationQuat([0, 0.0000005, 0, 1]);

        expect(networkTransform.isDirty(lastData)).to.equal(false);
    });

    it("treats opposite quaternion signs as the same rotation", () => {
        const entity = new Entity();
        const networkTransform = new NetworkTransform();
        entity.addComponent(networkTransform);
        const transform = entity.getComponent(Transform)!;
        transform.setRotationQuat([0, 0.5, 0, 0.8660254]);
        const lastData = networkTransform.write();

        transform.setRotationQuat([0, -0.5, 0, -0.8660254]);

        expect(networkTransform.isDirty(lastData)).to.equal(false);
    });

    it("detects meaningful scale and rotation changes", () => {
        const entity = new Entity();
        const networkTransform = new NetworkTransform();
        entity.addComponent(networkTransform);
        const transform = entity.getComponent(Transform)!;
        const lastData = networkTransform.write();

        transform.setScale([1.01, 1, 1]);
        expect(networkTransform.isDirty(lastData)).to.equal(true);

        transform.setScale([1, 1, 1]);
        transform.setRotationQuat([0, 0.1, 0, 0.9949874]);
        expect(networkTransform.isDirty(lastData)).to.equal(true);
    });
});
