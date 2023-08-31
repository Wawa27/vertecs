import NetworkComponent from "./NetworkComponent";
type NetworkData = {
    parent: string;
};
export type NetworkScope = "public" | "private";
/**
 * This component is used to mark an entity as networked, it is used by the network systems to determine which entities to send to which clients.
 */
export default class IsNetworked extends NetworkComponent<NetworkData> {
    #private;
    constructor(ownerId?: string, scope?: NetworkScope);
    accept(data: NetworkData): boolean;
    read(data: NetworkData): void;
    write(): NetworkData;
    isDirty(): boolean;
}
export {};
