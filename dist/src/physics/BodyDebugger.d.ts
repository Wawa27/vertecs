import { Component, Entity } from "../core";
export default class BodyDebugger extends Component {
    constructor();
    onAddedToEntity(entity: Entity): void;
    onRemovedFromEntity(entity: Entity): void;
}
