import type { SerializedNetworkComponent } from "./NetworkComponent";
import { SerializedEntity } from "../io";

export default class NetworkEntity extends SerializedEntity {
    public constructor(
        id: string,
        components: Map<string, SerializedNetworkComponent<any>>,
        name?: string
    ) {
        super(id, components, name);
    }

    toJSON(): any {
        return {
            id: this.$id,
            components: Array.from(this.components.entries()),
            name: this.$name,
            destroyed: this.$destroyed,
        };
    }

    static reviver(key: string, value: any): any {
        if (key === "components") {
            return new Map(value);
        }
        return value;
    }

    public get components(): Map<string, SerializedNetworkComponent<any>> {
        return this.$components as Map<string, SerializedNetworkComponent<any>>;
    }
}
