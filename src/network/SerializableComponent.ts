import { Component, Entity } from "../core";

/**
 * A serializable component is a component that can be serialized and deserialized,
 * it is used to send components over the network or to save them to a file for example
 */
export default abstract class SerializableComponent<T> extends Component {
    #isPrivate: boolean;

    #isClientScoped: boolean;

    protected constructor(isPrivate = false, isClientScoped = false) {
        super();
        this.#isPrivate = isPrivate;
        this.#isClientScoped = isClientScoped;
    }

    /**
     * Server-side only. Return true if the component can be updated from the client.
     * @param data
     */
    public abstract accept(data: T): boolean;

    /**
     * Check for data synchronization, return true if the data is dirty and need to be sent over the network
     */
    public abstract shouldUpdate(): boolean;

    /**
     * This method is server-side only, it is used to for additional checks before sending the data to the client.
     * It is called if the {@link isClientScoped} flag is true and is called for each client connected to the server.
     * By default, it will call the {@link shouldUpdate} method.
     *
     * @param entity The client entity
     * @returns true if the data should be sent to the client
     */
    public shouldUpdateClient(entity: Entity): boolean {
        return this.shouldUpdate();
    }

    /**
     * This method is the non-entity-scoped equivalent of the {@link shouldUpdateClient} method.
     * It is called once if the {@link isClientScoped} flag is false and will update all the clients connected to the server.
     * By default, it will call the {@link shouldUpdate} method.
     *
     * @returns true if the data should be sent to all clients
     */
    public shouldUpdateClients(): boolean {
        return this.shouldUpdate();
    }

    /**
     * Serialize the component's data into a json object that can be sent over the network
     */
    public abstract serialize(): T;

    /**
     * Deserialize the json object, the data should come from a trusted source
     * @param data
     */
    public abstract deserialize(data: T): void;

    public get isPrivate(): boolean {
        return this.#isPrivate;
    }

    public set isPrivate(value: boolean) {
        this.#isPrivate = value;
    }

    public get isClientScoped(): boolean {
        return this.#isClientScoped;
    }

    public set isClientScoped(value: boolean) {
        this.#isClientScoped = value;
    }
}
