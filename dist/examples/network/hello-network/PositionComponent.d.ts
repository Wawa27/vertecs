import { Component, Entity } from "../../../src";
export default class PositionComponent extends Component {
    #private;
    constructor(x: number, y: number);
    onAddedToEntity(entity: Entity): void;
    get x(): number;
    set x(value: number);
    get y(): number;
    set y(value: number);
}
