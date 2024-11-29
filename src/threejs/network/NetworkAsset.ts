import { NetworkComponent } from "../../network";
import AssetManager from "../AssetManager";
import { Component } from "../../core";

export default class NetworkAsset extends NetworkComponent<string> {
    #assetName: string;

    public constructor(assetName: string) {
        super();
        this.#assetName = assetName;
    }

    accept(data: string): boolean {
        return false;
    }

    isDirty(lastData: string): boolean {
        return false;
    }

    read(assetName: string): void {
        this.entity?.addChild(AssetManager.get(assetName));
    }

    write(): string {
        return this.#assetName;
    }

    public clone(): Component {
        return new NetworkAsset(this.#assetName);
    }
}
