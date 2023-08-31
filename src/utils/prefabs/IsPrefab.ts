import { Component } from "../../core";

export default class IsPrefab extends Component {
    #prefabName: string;

    public constructor(prefabName: string) {
        super();
        this.#prefabName = prefabName;
    }

    public get prefabName(): string {
        return this.#prefabName;
    }

    public set prefabName(prefabName: string) {
        this.#prefabName = prefabName;
    }
}
