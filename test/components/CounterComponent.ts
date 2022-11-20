import Component from "src/core/Component";

/**
 * Simple components with a counter and increment method
 */
export default class CounterComponent extends Component {
    public count: number;

    public constructor() {
        super();
        this.count = 0;
    }

    public increment() {
        this.count++;
    }
}
