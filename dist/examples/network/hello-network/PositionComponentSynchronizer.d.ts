import SerializableComponent from "../../../src/io/SerializableComponent";
import { Entity } from "../../../src";
type PositionComponentData = {
    x: number;
    y: number;
};
export default class PositionComponentSynchronizer extends SerializableComponent<PositionComponentData> {
    #private;
    constructor();
    onAddedToEntity(entity: Entity): void;
    isDirty(): boolean;
    accept(data: PositionComponentData): boolean;
    write(): PositionComponentData;
    read(data: PositionComponentData): void;
}
export {};
