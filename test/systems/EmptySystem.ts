import EmptyComponent from "../components/EmptyComponent";
import System from "../../src/System";
import Entity from "../../src/Entity";

/**
 * Empty system
 */
export default class EmptySystem extends System {
    public constructor() {
        super([EmptyComponent]);
    }

    protected onLoop(entities: Entity[], deltaTime: number): void {}
}
