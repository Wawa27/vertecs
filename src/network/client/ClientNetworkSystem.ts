import { Entity, System } from "../../core";

export default abstract class ClientNetworkSystem extends System {
    protected constructor() {
        super([]);
    }

    protected onLoop(entities: Entity[], deltaTime: number): void {}

    /**
     * Called when the client is connected to the server.
     * @protected
     */
    protected abstract onConnect(): void;

    /**
     * Called when the client received a new entity from the server.
     * @protected
     */
    protected abstract onNewEntity(): void;
}
