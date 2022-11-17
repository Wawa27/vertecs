import SerializableComponent from "../../src/network/SerializableComponent";
import { Entity } from "../../src";
import PositionComponent from "./PositionComponent";

type PositionComponentData = {
    x: number;
    y: number;
};

export default class PositionComponentSynchronizer extends SerializableComponent<PositionComponentData> {
    public constructor() {
        super();
    }

    public onAddedToEntity(entity: Entity) {
        if (!entity.findComponent(PositionComponent)) {
            entity.addComponent(new PositionComponent(0, 0));
        }
    }

    public isDirty(): boolean {
        return true;
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

    public serialize(): PositionComponentData {
        const positionComponent = this.entity?.findComponent(PositionComponent);
        if (!positionComponent) {
            throw new Error("PositionComponent not found");
        }
        return {
            x: positionComponent?.x ?? 0,
            y: positionComponent?.y ?? 0,
        };
    }

    public deserialize(data: PositionComponentData): void {
        const positionComponent = this.entity?.findComponent(PositionComponent);
        if (!positionComponent) {
            throw new Error("PositionComponent not found");
        }
        console.debug("New position", data);
        positionComponent.x = data.x;
        positionComponent.y = data.y;
    }
}
