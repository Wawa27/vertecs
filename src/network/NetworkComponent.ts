import type { SerializedComponent } from "../io";
import { SerializableComponent } from "../io";

export type SerializedNetworkComponent<T> = SerializedComponent<T> & {
    ownerId?: string;
    scope?: string;
    updateTimestamp?: number;
};

/**
 * A network component is a component that is used to synchronize data over the network.
 */
export default abstract class NetworkComponent<
    T
> extends SerializableComponent<T> {
    #ownerId?: string;

    protected $updateTimestamp?: number;

    #scope?: string;

    #forceUpdate;

    protected constructor(ownerId?: string, scope = "public") {
        super();
        this.#scope = scope;
        this.#ownerId = ownerId;
        this.$updateTimestamp = -1;
        this.#forceUpdate = true;
    }

    public serialize(addNetworkMetadata = true): SerializedNetworkComponent<T> {
        let data: SerializedNetworkComponent<T> = super.serialize(false);
        if (addNetworkMetadata) {
            data = {
                ...data,
                ownerId: this.#ownerId,
                scope: this.#scope,
                updateTimestamp: this.$updateTimestamp,
            };
        }
        return data;
    }

    public deserialize(
        serializedComponent: SerializedNetworkComponent<T>
    ): void {
        this.$updateTimestamp = serializedComponent.updateTimestamp;
        this.#ownerId = serializedComponent.ownerId;
        this.#scope = serializedComponent.scope;
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
    public abstract shouldUpdate(): boolean;

    public get forceUpdate(): boolean {
        return this.#forceUpdate;
    }

    public set forceUpdate(value: boolean) {
        this.#forceUpdate = value;
    }

    public get scope(): string | undefined {
        return this.#scope;
    }

    public set scope(value: string | undefined) {
        this.#scope = value;
    }

    public get updateTimestamp(): number | undefined {
        return this.$updateTimestamp;
    }

    public get ownerId(): string | undefined {
        return this.#ownerId;
    }

    public set ownerId(value: string | undefined) {
        this.#ownerId = value;
    }
}
