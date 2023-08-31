import System from "../../../src/core/System";
import EmptyComponent from "../components/EmptyComponent";
/**
 * Empty system
 */
export default class EmptySystem extends System {
    constructor() {
        super([EmptyComponent]);
    }
    onLoop(components, entities, deltaTime) { }
}
