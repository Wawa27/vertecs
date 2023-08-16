import type { SerializedComponent } from "../io";
import { SerializableComponent } from "../io";

export type SerializedNetworkComponent<T> = SerializedComponent<T> & {
    updateTimestamp: number;
};

/**
 * A network component is a component that is used to synchronize data over the network.
 */
export default abstract class NetworkComponent<
    T
> extends SerializableComponent<T> {
    protected $updateTimestamp: number;

    #forceUpdate;

    protected constructor() {
        super();
        this.$updateTimestamp = -1;
        this.#forceUpdate = true;
    }

    public serialize(): SerializedNetworkComponent<T> {
        const data = {
            ...super.serialize(false),
            updateTimestamp: this.$updateTimestamp,
        };
        this.#forceUpdate = false;
        return data;
    }

    public deserialize(
        serializedComponent: SerializedNetworkComponent<T>
    ): void {
        this.$updateTimestamp = serializedComponent.updateTimestamp ?? -1;
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

    public get updateTimestamp(): number | undefined {
        return this.$updateTimestamp;
    }
}
