import { Entity } from "../core";
import { SerializableComponent } from "../io";

export default abstract class NetworkableComponent<
    T
> extends SerializableComponent<T> {
    /**
     * Flag that indicates if the component is private and should not be sent to other clients.
     * @private
     */
    #isPrivate: boolean;

    #isClientScoped: boolean;

    protected constructor(isPrivate = false, isClientScoped = false) {
        super();
        this.#isClientScoped = isClientScoped;
        this.#isPrivate = isPrivate;
    }

    /**
     * Check for data synchronization, return true if the data is dirty and need to be sent over the networking
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
