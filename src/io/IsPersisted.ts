import { Component } from "../core";
import SerializableComponent from "./SerializableComponent";

export default class IsPersisted extends SerializableComponent<undefined> {
    public constructor() {
        super();
    }

    public read(data: undefined): void {}

    public write(): undefined {
        return undefined;
    }

    public clone(): Component {
        return new IsPersisted();
    }
}
