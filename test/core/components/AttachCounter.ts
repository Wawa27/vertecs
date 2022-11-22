import Component from "../../../src/core/Component";

/**
 * Component that tracks the number of time it was attached to an entity
 */
export default class AttachCounter extends Component {
    public counter: number;

    public constructor() {
        super();
        this.counter = 0;
    }

    public onAddedToEntity() {
        this.counter++;
    }
}
