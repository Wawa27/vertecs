import { NetworkComponent } from "../../network";
import { Entity } from "../../core";
type SphereBodyData = {
    movable: boolean;
    radius: number;
};
export default class NetworkSphereBody extends NetworkComponent<SphereBodyData> {
    constructor();
    onAddedToEntity(entity: Entity): void;
    accept(data: SphereBodyData): boolean;
    isDirty(): boolean;
    read(data: SphereBodyData): void;
    write(): SphereBodyData;
    clone(): NetworkSphereBody;
}
export {};
