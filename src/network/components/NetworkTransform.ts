import { quat, vec3 } from "gl-matrix";
import { Component, Entity } from "../../core";
import { Transform } from "../../math";
import NetworkComponent from "../NetworkComponent";

export type TransformData = {
    position: [number, number, number];
    rotation: [number, number, number, number];
    scale: [number, number, number];
};

export default class NetworkTransform extends NetworkComponent<TransformData> {
    #lastPosition: vec3;

    public constructor(ownerId?: string, scope = "public") {
        super(ownerId, scope);
        this.#lastPosition = vec3.fromValues(Infinity, Infinity, Infinity);
    }

    public onAddedToEntity(entity: Entity) {
        if (!entity.getComponent(Transform)) {
            entity.addComponent(new Transform());
        }
    }

    public accept(data: TransformData): boolean {
        // TODO: Add validation, for example, if the position is too far away from the current position, return false
        return true;
    }

    public read(data: TransformData): void {
        this.#lastPosition = vec3.fromValues(
            data.position[0],
            data.position[1],
            data.position[2]
        );

        const transform = this.entity?.getComponent(Transform);

        if (!transform) {
            console.warn("TransformNetworkComponent: Transform not found");
            return;
        }

        transform.setPosition(data.position);
        transform.setRotationQuat(data.rotation);
        transform.setScale(data.scale);
    }

    public shouldUpdate(): boolean {
        const position = this.entity
            ?.getComponent(Transform)
            ?.getWorldPosition(vec3.create());

        if (!position) {
            throw new Error("TransformNetworkComponent: Position not found");
        }

        const distance = vec3.distance(this.#lastPosition, position);

        if (distance > 0.01) {
            this.#lastPosition = vec3.fromValues(
                position[0],
                position[1],
                position[2]
            );
            this.$updateTimestamp = Date.now();
        }

        return distance > 0.01;
    }

    public write(): TransformData {
        const transform = this.entity?.getComponent(Transform);

        if (!transform) {
            throw new Error("TransformNetworkComponent: Transform not found");
        }

        const position = transform.getWorldPosition(vec3.create());
        const rotation = transform.getWorldRotation(quat.create());
        const scale = transform.getWorldScale(vec3.create());

        return {
            position: [position[0], position[1], position[2]],
            rotation: [rotation[0], rotation[1], rotation[2], rotation[3]],
            scale: [scale[0], scale[1], scale[2]],
        };
    }

    public clone(): Component {
        return new NetworkTransform(this.ownerId, this.scope);
    }
}
