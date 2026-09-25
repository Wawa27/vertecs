import { Component, Entity } from "../../core";
import { Transform } from "../../math";
import NetworkComponent from "../network.component";
import { Quat, Vec3 } from "ts-gl-matrix";

const TRANSFORM_EPSILON = 0.00001;

const approximatelyEqual = (a: number, b: number): boolean =>
    Math.abs(a - b) <=
    TRANSFORM_EPSILON * Math.max(1, Math.abs(a), Math.abs(b));

const approximatelyEqualRotation = (
    a: [number, number, number, number],
    b: ArrayLike<number>
): boolean => {
    const sameSign = a.every((value, index) =>
        approximatelyEqual(value, b[index])
    );
    const oppositeSign = a.every((value, index) =>
        approximatelyEqual(value, -b[index])
    );
    return sameSign || oppositeSign;
};

export type TransformData = {
    position: [number, number, number];
    rotation: [number, number, number, number];
    scale: [number, number, number];
};

export default class NetworkTransform extends NetworkComponent<TransformData> {
    #clonedData: TransformData | null;

    public constructor() {
        super();
        this.#clonedData = null;
    }

    public onAddedToEntity(entity: Entity) {
        if (this.#clonedData) {
            entity.addComponent(new Transform(
                this.#clonedData.position,
                this.#clonedData.rotation,
                this.#clonedData.scale,
            ));
        } else if (!entity.getComponent(Transform)) {
            entity.addComponent(new Transform());
        }
    }

    public accept(data: TransformData): boolean {
        // TODO: Add validation, for example, if the position is too far away from the current position, return false
        return true;
    }

    public read(data: TransformData): void {
        const transform = this.entity?.getComponent(Transform);

        if (!transform) {
            console.warn("NetworkTransform: Transform not found");
            return;
        }

        transform.setWorldPosition([...data.position]);
        transform.setWorldRotation([...data.rotation]);
        transform.setWorldScale([...data.scale]);
    }

    protected override replay(
        previousData: TransformData,
        data: TransformData
    ): void {
        const transform = this.entity?.getComponent(Transform);
        if (!transform) {
            return;
        }

        const positionDelta = Vec3.sub(
            Vec3.create(),
            data.position,
            previousData.position
        );
        transform.setWorldPosition(
            Vec3.add(
                Vec3.create(),
                transform.getWorldPosition(),
                positionDelta
            )
        );

        const inversePreviousRotation = Quat.invert(
            Quat.create(),
            previousData.rotation
        );
        const rotationDelta = Quat.multiply(
            Quat.create(),
            inversePreviousRotation,
            data.rotation
        );
        transform.setWorldRotation(
            Quat.multiply(
                Quat.create(),
                transform.getWorldRotation(),
                rotationDelta
            )
        );

        const currentScale = transform.getWorldScale();
        transform.setWorldScale([
            previousData.scale[0] === 0
                ? data.scale[0]
                : currentScale[0] *
                  (data.scale[0] / previousData.scale[0]),
            previousData.scale[1] === 0
                ? data.scale[1]
                : currentScale[1] *
                  (data.scale[1] / previousData.scale[1]),
            previousData.scale[2] === 0
                ? data.scale[2]
                : currentScale[2] *
                  (data.scale[2] / previousData.scale[2]),
        ]);
    }

    public isDirty(lastData: TransformData): boolean {
        const transform = this.entity?.getComponent(Transform);

        if (!transform) {
            throw new Error("NetworkTransform: Position not found");
        }

        const position = transform.getWorldPosition();
        const rotation = transform.getWorldRotation();
        const scale = transform.getWorldScale();

        return (
            position.distance(lastData.position) > 0.1 ||
            !approximatelyEqualRotation(lastData.rotation, rotation) ||
            !approximatelyEqual(scale[0], lastData.scale[0]) ||
            !approximatelyEqual(scale[1], lastData.scale[1]) ||
            !approximatelyEqual(scale[2], lastData.scale[2])
        );
    }

    public write(): TransformData {
        const transform = this.entity?.getComponent(Transform);

        if (!transform) {
            throw new Error("NetworkTransform: Transform not found");
        }

        const position = transform.getWorldPosition();
        const rotation = transform.getWorldRotation();
        const scale = transform.getWorldScale();

        return {
            position: [position[0], position[1], position[2]],
            rotation: [rotation[0], rotation[1], rotation[2], rotation[3]],
            scale: [scale[0], scale[1], scale[2]],
        };
    }

    public clone(): Component {
        const clone = new NetworkTransform();
        const transform = this.entity?.getComponent(Transform);
        if (transform) {
            clone.#clonedData = {
                position: [
                    transform.getWorldPosition()[0],
                    transform.getWorldPosition()[1],
                    transform.getWorldPosition()[2],
                ] as [number, number, number],
                rotation: [
                    transform.getWorldRotation()[0],
                    transform.getWorldRotation()[1],
                    transform.getWorldRotation()[2],
                    transform.getWorldRotation()[3],
                ] as [number, number, number, number],
                scale: [
                    transform.getWorldScale()[0],
                    transform.getWorldScale()[1],
                    transform.getWorldScale()[2],
                ] as [number, number, number],
            };
        }
        return clone;
    }
}
