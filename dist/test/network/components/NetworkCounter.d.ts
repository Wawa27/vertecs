import { Entity } from "../../../src/core";
import NetworkComponent from "../../../src/network/NetworkComponent";
type CounterComponentData = {
    count: number;
};
export default class NetworkCounter extends NetworkComponent<CounterComponentData> {
    #private;
    constructor();
    onAddedToEntity(entity: Entity): void;
    accept(data: CounterComponentData): boolean;
    read(data: CounterComponentData): void;
    write(): CounterComponentData;
    isDirty(): boolean;
}
export {};
