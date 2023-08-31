import System from "../../../src/core/System";
import Entity from "../../../src/core/Entity";
import EmptyComponent from "../components/EmptyComponent";
/**
 * Empty system
 */
export default class EmptySystem extends System<[EmptyComponent]> {
    constructor();
    protected onLoop(components: [EmptyComponent][], entities: Entity[], deltaTime: number): void;
}
