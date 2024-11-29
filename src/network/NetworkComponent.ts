import type { SerializedComponent } from "../io";
import { SerializableComponent } from "../io";
import { NetworkScope } from "./IsNetworked";

export type SerializedNetworkComponent<T> = SerializedComponent<T> & {
    updateTimestamp: number;
    ownerId?: string;
    scope?: NetworkScope;
};

/**
 * A network component is a component that is used to synchronize data over the network.
 * Components that inherit from this class will be synchronized over the network if they are attached to a networked entity.
 */
export default abstract class NetworkComponent<
    T,
> extends SerializableComponent<T> {
    protected $updateTimestamp: number;

    $forceUpdate: boolean;

    #lastData?: T;

    #ownerId: string;

    #scope: NetworkScope;

    protected constructor(ownerId?: string, scope?: NetworkScope) {
        super();
        this.$updateTimestamp = -1;
        this.$forceUpdate = true;
        this.#ownerId = ownerId ?? "*";
        this.#scope = scope ?? "public";
    }

    public serialize(
        addNetworkMetadata?: boolean
    ): SerializedNetworkComponent<T> {
        const data: SerializedNetworkComponent<T> = {
            ...super.serialize(false),
            updateTimestamp: this.$updateTimestamp,
        };
        if (addNetworkMetadata) {
            data.ownerId = this.#ownerId;
            data.scope = this.#scope;
        }
        this.$forceUpdate = false;
        this.#lastData = data.data;
        return data;
    }

    public deserialize(
        serializedComponent: SerializedNetworkComponent<T>
    ): void {
        this.$updateTimestamp = serializedComponent.updateTimestamp ?? -1;
        this.#ownerId = serializedComponent.ownerId ?? this.ownerId;
        this.#scope = serializedComponent.scope ?? this.scope;
        this.#lastData = serializedComponent.data;
        return this.read(serializedComponent.data);
    }

    /**
     * Server-side only. Return true if the component can be updated from the client.
     * @param data
     */
    public abstract accept(data: T): boolean;

    /**
     * Check for data synchronization, return true if the data is dirty and need to be sent over the networking
     */
    public abstract isDirty(lastData: T): boolean;

    public get scope(): NetworkScope {
        return this.#scope;
    }

    public set scope(value: NetworkScope) {
        this.#scope = value;
    }

    public get ownerId(): string {
        return this.#ownerId;
    }

    public set ownerId(value: string) {
        this.#ownerId = value;
    }

    public get forceUpdate(): boolean {
        return this.$forceUpdate;
    }

    public set forceUpdate(value: boolean) {
        this.$forceUpdate = value;
    }

    public get lastData(): T | undefined {
        return this.#lastData;
    }

    public get updateTimestamp(): number | undefined {
        return this.$updateTimestamp;
    }

    public set updateTimestamp(value: number | undefined) {
        this.$updateTimestamp = value ?? -1;
    }
}
