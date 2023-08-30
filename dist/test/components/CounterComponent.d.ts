import Component from "../../src/core/Component";
/**
 * Simple components with a counter and increment method
 */
export default class CounterComponent extends Component {
    count: number;
    constructor(counter?: number);
    increment(): void;
}
