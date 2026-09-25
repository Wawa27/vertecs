import type { SerializedComponent } from "../io";
import { SerializableComponent } from "../io";
import { NetworkScope } from "./is-networked.component";

export type SerializedNetworkComponent<T> = SerializedComponent<T> & {
    updateTimestamp: number;
    ownerId?: string;
    scope?: NetworkScope;
};

export type PendingNetworkComponentUpdate<T> = {
    previousData: T;
    data: T;
};

/**
 * A network component is a component that is used to synchronize data over the network.
 * Components that inherit from this class will be synchronized over the network if they are attached to a networked entity.
 */
export default abstract class NetworkComponent<
    T,
> extends SerializableComponent<T> {
    protected $updateTimestamp: number;

    #lastData?: T;

    #ownerId: string;

    #scope: NetworkScope;

    #networkUpdateRevision: number;

    protected constructor(ownerId?: string, scope?: NetworkScope) {
        super();
        this.$updateTimestamp = -1;
        this.#ownerId = ownerId ?? "*";
        this.#scope = scope ?? "public";
        this.#networkUpdateRevision = 0;
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
     * Apply an authoritative value, then replay client-side changes that the
     * server has not acknowledged yet.
     */
    public reconcile(
        serializedComponent: SerializedNetworkComponent<T>,
        pendingUpdates: PendingNetworkComponentUpdate<T>[],
        uncommittedUpdate?: PendingNetworkComponentUpdate<T>
    ): void {
        this.deserialize(serializedComponent);
        pendingUpdates.forEach(({ previousData, data }) => {
            this.replay(previousData, data);
        });

        if (pendingUpdates.length > 0) {
            this.#lastData = this.write();
        }

        if (uncommittedUpdate) {
            this.replay(uncommittedUpdate.previousData, uncommittedUpdate.data);
        }
    }

    /** Reapply one predicted client change after an authoritative update. */
    protected replay(_previousData: T, data: T): void {
        this.read(data);
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

    public get lastData(): T | undefined {
        return this.#lastData;
    }

    public get updateTimestamp(): number | undefined {
        return this.$updateTimestamp;
    }

    public set updateTimestamp(value: number | undefined) {
        this.$updateTimestamp = value ?? -1;
    }

    /** Force the server to send the current value, even if it is unchanged. */
    public requestNetworkUpdate(): void {
        this.#networkUpdateRevision += 1;
    }

    public get networkUpdateRevision(): number {
        return this.#networkUpdateRevision;
    }
}
