import Component from "../../../src/core/Component";
/**
 * Component that tracks the number of time it was attached to an entity
 */
export default class AttachCounter extends Component {
    counter: number;
    constructor();
    onAddedToEntity(): void;
}
