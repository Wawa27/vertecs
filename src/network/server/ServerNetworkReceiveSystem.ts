import { System } from "../../core";
import ServerNetworkSystem from "./ServerNetworkSystem";

/** Applies queued client snapshots before authoritative game systems run. */
export default class ServerNetworkReceiveSystem extends System<[]> {
    readonly #serverNetworkSystem: ServerNetworkSystem;

    public constructor(serverNetworkSystem: ServerNetworkSystem) {
        super([], serverNetworkSystem.tps);
        this.#serverNetworkSystem = serverNetworkSystem;
    }

    protected onLoop(): void {
        this.#serverNetworkSystem.processClientSnapshots();
    }
}
