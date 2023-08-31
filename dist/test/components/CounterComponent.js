import Component from "../../src/core/Component";
/**
 * Simple components with a counter and increment method
 */
export default class CounterComponent extends Component {
    count;
    constructor(counter) {
        super();
        this.count = counter || 0;
    }
    increment() {
        this.count++;
    }
}
