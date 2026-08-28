import { NetworkComponent } from "../../network";
import AssetManager from "../AssetManager";
import { Component } from "../../core";
import { Transform } from "../../math";

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
        if (this.#assetName === assetName) {
            return;
        }
        this.#assetName = assetName;

        // TODO: check if server or client
        if (AssetManager.getAssetNames().length === 0) {
            return;
        }

        const asset = AssetManager.get(assetName);
        asset.getComponent(Transform)?.reset();
        this.entity!.addChild(asset);
    }

    write(): string {
        return this.#assetName;
    }

    public clone(): Component {
        return new NetworkAsset(this.#assetName);
    }

    public get assetName(): string {
        return this.#assetName;
    }
}
