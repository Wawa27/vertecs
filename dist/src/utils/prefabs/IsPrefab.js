import { Component } from "../../core";
export default class IsPrefab extends Component {
    #prefabName;
    constructor(prefabName) {
        super();
        this.#prefabName = prefabName;
    }
    get prefabName() {
        return this.#prefabName;
    }
    set prefabName(prefabName) {
        this.#prefabName = prefabName;
    }
}
