import { Component } from "../core";
export default class OimoComponent extends Component {
    #bodyOptions;
    #body;
    constructor(bodyOptions) {
        super();
        this.#bodyOptions = bodyOptions;
    }
    get bodyOptions() {
        return this.#bodyOptions;
    }
    get body() {
        return this.#body;
    }
    set body(body) {
        this.#body = body;
    }
    clone() {
        return new OimoComponent(this.#bodyOptions);
    }
}
