import type { SerializedNetworkComponent } from "./NetworkComponent";
import { SerializedEntity } from "../io";
/**
 * JSON representation of an entity that is synchronized over the network.
 */
export default class NetworkEntity extends SerializedEntity {
    constructor(id: string, components: Map<string, SerializedNetworkComponent<any>>, name?: string, prefabName?: string);
    toJSON(): any;
    static reviver(key: string, value: any): any;
    get components(): Map<string, SerializedNetworkComponent<any>>;
}
