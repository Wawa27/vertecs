import { quat } from "ts-gl-matrix";
import { Component, Entity } from "../../core";
import { Transform } from "../../math";
import NetworkComponent from "../network.component";

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

        transform.setWorldPosition(data.position);
        transform.setWorldRotation(data.rotation);
        transform.setWorldScale(data.scale);
    }

    public isDirty(lastData: TransformData): boolean {
        const transform = this.entity?.getComponent(Transform);

        if (!transform) {
            throw new Error("NetworkTransform: Position not found");
        }

        const position = transform.getWorldPosition();
        const scale = transform.getWorldScale();

        return (
            position.distance(lastData.position) > 0.1 ||
            !quat.equals(lastData.rotation, transform.getWorldRotation()) ||
            scale[0] !== lastData.scale[0] ||
            scale[1] !== lastData.scale[1] ||
            scale[2] !== lastData.scale[2]
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