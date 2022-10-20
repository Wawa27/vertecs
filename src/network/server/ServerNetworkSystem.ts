import { Entity, System } from "../../core";

export default class ServerNetworkSystem extends System {
    public constructor() {
        super([]);
    }

    protected onLoop(entities: Entity[], deltaTime: number): void {}
}
