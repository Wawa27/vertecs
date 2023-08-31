import { Entity } from "../../../core";
export default class Endpoint {
    #private;
    constructor(value: number, isMinimum: boolean, entity: Entity);
    get value(): number;
    set value(value: number);
    get isMinimum(): boolean;
    set isMinimum(isMinimum: boolean);
    get entity(): Entity;
    set entity(entity: Entity);
}
