import Component from "../../src/core/Component";

/**
 * Simple components with a counter and increment method
 */
export default class CounterComponent extends Component {
    public count: number;

    public constructor(counter?: number) {
        super();
        this.count = counter || 0;
    }

    public increment() {
        this.count++;
    }
}
