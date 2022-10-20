import EmptyComponent from "../components/EmptyComponent";
import System from "../../src/core/System";
import Entity from "../../src/core/Entity";

/**
 * Empty system
 */
export default class EmptySystem extends System {
    public constructor() {
        super([EmptyComponent]);
    }

    protected onLoop(entities: Entity[], deltaTime: number): void {}
}
