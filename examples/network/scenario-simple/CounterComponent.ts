import { Component } from "../../../src";

export default class CounterComponent extends Component {
    public value: number;

    public constructor(value = 0) {
        super();
        this.value = value;
    }
}
