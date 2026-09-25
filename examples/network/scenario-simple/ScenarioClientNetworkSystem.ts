import { ClientNetworkSystem, Entity, IsNetworked } from "../../../src";
import CounterNetworkComponent from "./CounterNetworkComponent";

export default class ScenarioClientNetworkSystem extends ClientNetworkSystem {
    #connected = false;

    #paused = false;

    public constructor(address: string) {
        super([CounterNetworkComponent], address, undefined, 30);
    }

    public override loop(
        components: [IsNetworked][],
        entities: Entity[]
    ): void {
        if (!this.#paused) {
            super.loop(components, entities);
        }
    }

    protected onConnect(): void {
        this.#connected = true;
    }

    protected onDisconnect(): void {
        this.#connected = false;
    }

    protected onNewEntity(entity: Entity): void {}

    protected onDeletedEntity(entity: Entity): void {}

    public get connected(): boolean {
        return this.#connected;
    }

    public get paused(): boolean {
        return this.#paused;
    }

    public set paused(value: boolean) {
        this.#paused = value;
    }
}
