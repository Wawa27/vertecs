import { NetworkComponent } from "../../../../src";
import Velocity from "./Velocity";
export default class NetworkVelocity extends NetworkComponent {
    #lastX;
    #lastY;
    constructor() {
        super();
        this.#lastX = Infinity;
        this.#lastY = Infinity;
    }
    onAddedToEntity(entity) {
        if (!entity.getComponent(Velocity)) {
            entity.addComponent(new Velocity());
        }
    }
    accept(data) {
        return false;
    }
    read(data) {
        const velocity = this.entity?.getComponent(Velocity);
        if (!velocity) {
            throw new Error("Velocity not found");
        }
        velocity.x = data.x;
        velocity.y = data.y;
    }
    isDirty() {
        const shouldUpdate = this.#lastX !== this.entity?.getComponent(Velocity)?.x ||
            this.#lastY !== this.entity?.getComponent(Velocity)?.y;
        if (shouldUpdate) {
            this.$updateTimestamp = Date.now();
        }
        return shouldUpdate;
    }
    write() {
        const velocity = this.entity?.getComponent(Velocity);
        if (!velocity) {
            throw new Error("Velocity not found");
        }
        this.#lastX = velocity.x;
        this.#lastY = velocity.y;
        return {
            x: velocity.x,
            y: velocity.y,
        };
    }
}
