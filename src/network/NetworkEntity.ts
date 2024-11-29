import type { SerializedNetworkComponent } from "./NetworkComponent";
import { SerializedEntity } from "../io";

/**
 * JSON representation of an entity that is synchronized over the network.
 */
export default class NetworkEntity extends SerializedEntity {
    $isDestroyed: boolean;

    public constructor(
        id: string,
        components: Map<string, SerializedNetworkComponent<any>>,
        isDestroyed: boolean,
        tags: string[],
        prefabName?: string,
        name?: string,
        parentId?: string
    ) {
        super(id, components, name, parentId, prefabName, tags);
        this.$isDestroyed = isDestroyed;
    }

    toJSON(): any {
        return {
            id: this.$id,
            parentId: this.$parentId,
            components: Array.from(this.components.entries()),
            isDestroyed: this.$isDestroyed,
            name: this.$name,
            prefabName: this.$prefabName,
            tags: this.$tags,
        };
    }

    static reviver(key: string, value: any): any {
        if (key === "components") {
            return new Map(value);
        }
        return value;
    }

    public get isDestroyed(): boolean {
        return this.$isDestroyed;
    }

    public set isDestroyed(value: boolean) {
        this.$isDestroyed = value;
    }

    public get components(): Map<string, SerializedNetworkComponent<any>> {
        return this.$components as Map<string, SerializedNetworkComponent<any>>;
    }
}
