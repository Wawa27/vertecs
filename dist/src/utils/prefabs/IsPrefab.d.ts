import { Component } from "../../core";
export default class IsPrefab extends Component {
    #private;
    constructor(prefabName: string);
    get prefabName(): string;
    set prefabName(prefabName: string);
}
