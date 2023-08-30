import type { SerializedComponent } from "../io";
import { SerializableComponent } from "../io";
import { NetworkScope } from "./IsNetworked";
export type SerializedNetworkComponent<T> = SerializedComponent<T> & {
    updateTimestamp: number;
};
/**
 * A network component is a component that is used to synchronize data over the network.
 * Components that inherit from this class will be synchronized over the network if they are attached to a networked entity.
 */
export default abstract class NetworkComponent<T> extends SerializableComponent<T> {
    #private;
    protected $updateTimestamp: number;
    $forceUpdate: boolean;
    protected constructor(ownerId?: string, scope?: NetworkScope);
    serialize(): SerializedNetworkComponent<T>;
    deserialize(serializedComponent: SerializedNetworkComponent<T>): void;
    /**
     * Server-side only. Return true if the component can be updated from the client.
     * @param data
     */
    abstract accept(data: T): boolean;
    /**
     * Check for data synchronization, return true if the data is dirty and need to be sent over the networking
     */
    abstract isDirty(lastData: T): boolean;
    get scope(): NetworkScope;
    set scope(value: NetworkScope);
    get ownerId(): string;
    set ownerId(value: string);
    get forceUpdate(): boolean;
    set forceUpdate(value: boolean);
    get lastData(): T | undefined;
    get updateTimestamp(): number | undefined;
    set updateTimestamp(value: number | undefined);
}
