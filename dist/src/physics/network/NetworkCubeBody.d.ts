import { NetworkComponent } from "../../network";
import { Entity } from "../../core";
type CubeBodyData = {
    movable: boolean;
    width: number;
    height: number;
    depth: number;
};
export default class NetworkSphereBody extends NetworkComponent<CubeBodyData> {
    constructor();
    onAddedToEntity(entity: Entity): void;
    accept(data: CubeBodyData): boolean;
    isDirty(): boolean;
    read(data: CubeBodyData): void;
    write(): CubeBodyData;
    clone(): NetworkSphereBody;
}
export {};
