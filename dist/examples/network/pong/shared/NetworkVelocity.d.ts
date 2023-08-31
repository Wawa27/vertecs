import { Entity, NetworkComponent } from "../../../../src";
type VelocityData = {
    x: number;
    y: number;
};
export default class NetworkVelocity extends NetworkComponent<VelocityData> {
    #private;
    constructor();
    onAddedToEntity(entity: Entity): void;
    accept(data: VelocityData): boolean;
    read(data: VelocityData): void;
    isDirty(): boolean;
    write(): VelocityData;
}
export {};
