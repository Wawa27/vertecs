import System from "../../../src/core/System";
import Entity from "../../../src/core/Entity";
import EmptyComponent from "../components/EmptyComponent";

/**
 * Empty system
 */
export default class EmptySystem extends System {
    public constructor() {
        super([EmptyComponent]);
    }

    protected onLoop(entities: Entity[], deltaTime: number): void {}
}
