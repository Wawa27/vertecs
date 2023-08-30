import { Component, Entity } from "../../core";
import { Transform } from "../../math";
import NetworkComponent from "../NetworkComponent";

export type TransformData = {
    position: [number, number, number];
    rotation: [number, number, number, number];
    scale: [number, number, number];
};

export default class NetworkTransform extends NetworkComponent<TransformData> {
    public constructor() {
        super();
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
        const transform = this.entity?.getComponent(Transform);

        if (!transform) {
            console.warn("TransformNetworkComponent: Transform not found");
            return;
        }

        transform.setPosition(data.position);
        transform.setRotationQuat(data.rotation);
        transform.setScale(data.scale);
    }

    public isDirty(lastData: TransformData): boolean {
        const position = this.entity
            ?.getComponent(Transform)
            ?.getWorldPosition();

        if (!position) {
            throw new Error("TransformNetworkComponent: Position not found");
        }

        return position.distance(lastData.position) > 0.1;
    }

    public write(): TransformData {
        const transform = this.entity?.getComponent(Transform);

        if (!transform) {
            throw new Error("TransformNetworkComponent: Transform not found");
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
        return new NetworkTransform();
    }
}
