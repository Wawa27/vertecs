import { Entity, System } from "../core";
import type { ComponentClass } from "../core/Component";
import Component from "../core/Component";
import IsNetworked from "./IsNetworked";

/**
 * The networking system is responsible for sending and receiving entities over the network.
 * This class is used by the server and the client to provide a common interface for formatting entities.
 */
export default class NetworkSystem extends System<[IsNetworked]> {
    $allowedNetworkComponents: ComponentClass<Component>[];

    public constructor(
        allowedNetworkComponents: ComponentClass[],
        tps?: number
    ) {
        super([IsNetworked], tps);

        this.$allowedNetworkComponents = [
            ...allowedNetworkComponents,
            IsNetworked,
        ];
    }

    protected onLoop(
        components: [IsNetworked][],
        entities: Entity[],
        deltaTime: number
    ): void {}

    public get allowedNetworkComponents(): ComponentClass[] {
        return this.$allowedNetworkComponents;
    }
}
