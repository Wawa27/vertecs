import SerializableComponent from "../../../src/io/SerializableComponent";
import PositionComponent from "./PositionComponent";
export default class PositionComponentSynchronizer extends SerializableComponent {
    #lastUpdate;
    constructor() {
        super();
        this.#lastUpdate = 0;
    }
    onAddedToEntity(entity) {
        if (!entity.findComponent(PositionComponent)) {
            entity.addComponent(new PositionComponent(0, 0));
        }
    }
    isDirty() {
        // In this example, we update the client/server every second
        if (Date.now() - this.#lastUpdate > 1000) {
            this.#lastUpdate = Date.now();
            return true;
        }
        return false;
    }
    accept(data) {
        const positionComponent = this.entity?.findComponent(PositionComponent);
        if (!positionComponent) {
            throw new Error("PositionComponent not found");
        }
        return (Math.abs(positionComponent.x - data.x) +
            Math.abs(positionComponent.y - data.y) >
            0.05);
    }
    write() {
        const positionComponent = this.entity?.findComponent(PositionComponent);
        if (!positionComponent) {
            throw new Error("PositionComponent not found");
        }
        return {
            x: positionComponent?.x ?? 0,
            y: positionComponent?.y ?? 0,
        };
    }
    read(data) {
        const positionComponent = this.entity?.findComponent(PositionComponent);
        if (!positionComponent) {
            throw new Error("PositionComponent not found");
        }
        positionComponent.x = data.x;
        positionComponent.y = data.y;
    }
}
