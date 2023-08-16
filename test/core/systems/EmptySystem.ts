import System from "../../../src/core/System";
import Entity from "../../../src/core/Entity";
import EmptyComponent from "../components/EmptyComponent";

/**
 * Empty system
 */
export default class EmptySystem extends System<[EmptyComponent]> {
    public constructor() {
        super([EmptyComponent]);
    }

    protected onLoop(
        components: [EmptyComponent][],
        entities: Entity[],
        deltaTime: number
    ): void {}
}
