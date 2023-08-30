import { Transform } from "../../math";
import NetworkComponent from "../NetworkComponent";
export default class NetworkTransform extends NetworkComponent {
    constructor() {
        super();
    }
    onAddedToEntity(entity) {
        if (!entity.getComponent(Transform)) {
            entity.addComponent(new Transform());
        }
    }
    accept(data) {
        // TODO: Add validation, for example, if the position is too far away from the current position, return false
        return true;
    }
    read(data) {
        const transform = this.entity?.getComponent(Transform);
        if (!transform) {
            console.warn("TransformNetworkComponent: Transform not found");
            return;
        }
        transform.setPosition(data.position);
        transform.setRotationQuat(data.rotation);
        transform.setScale(data.scale);
    }
    isDirty(lastData) {
        const position = this.entity
            ?.getComponent(Transform)
            ?.getWorldPosition();
        if (!position) {
            throw new Error("TransformNetworkComponent: Position not found");
        }
        return position.distance(lastData.position) > 0.1;
    }
    write() {
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
    clone() {
        return new NetworkTransform();
    }
}
