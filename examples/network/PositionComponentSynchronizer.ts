import SerializableComponent from "../../src/io/SerializableComponent";
import { Entity } from "../../src";
import PositionComponent from "./PositionComponent";

type PositionComponentData = {
    x: number;
    y: number;
};

export default class PositionComponentSynchronizer extends SerializableComponent<PositionComponentData> {
    #lastUpdate: number;

    public constructor() {
        super();
        this.#lastUpdate = 0;
    }

    public onAddedToEntity(entity: Entity) {
        if (!entity.findComponent(PositionComponent)) {
            entity.addComponent(new PositionComponent(0, 0));
        }
    }

    public shouldUpdate() {
        // In this example, we update the client/server every second
        if (Date.now() - this.#lastUpdate > 1000) {
            this.#lastUpdate = Date.now();
            return true;
        }
        return false;
    }

    public accept(data: PositionComponentData): boolean {
        const positionComponent = this.entity?.findComponent(PositionComponent);
        if (!positionComponent) {
            throw new Error("PositionComponent not found");
        }
        return (
            Math.abs(positionComponent.x - data.x) +
                Math.abs(positionComponent.y - data.y) >
            0.05
        );
    }

    public write(): PositionComponentData {
        const positionComponent = this.entity?.findComponent(PositionComponent);
        if (!positionComponent) {
            throw new Error("PositionComponent not found");
        }
        return {
            x: positionComponent?.x ?? 0,
            y: positionComponent?.y ?? 0,
        };
    }

    public read(data: PositionComponentData): void {
        const positionComponent = this.entity?.findComponent(PositionComponent);
        if (!positionComponent) {
            throw new Error("PositionComponent not found");
        }
        positionComponent.x = data.x;
        positionComponent.y = data.y;
    }
}
