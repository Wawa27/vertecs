import { ClientNetworkSystem } from "src/network";
import { ComponentClass } from "src/core/Component";
import { Entity } from "src/core";

export default class TestClientNetworkSystem extends ClientNetworkSystem {
    #isConnected: boolean;

    #newEntities: Entity[];

    public constructor(
        allowedNetworkComponents: ComponentClass[],
        address: string
    ) {
        super(allowedNetworkComponents, address);
        this.#isConnected = false;
        this.#newEntities = [];
    }

    protected onConnect(): void {
        this.#isConnected = true;
    }

    protected onNewEntity(entity: Entity): void {
        this.#newEntities.push(entity);
    }

    public get isConnected(): boolean {
        return this.#isConnected;
    }

    public set isConnected(value: boolean) {
        this.#isConnected = value;
    }

    public get newEntities(): Entity[] {
        return this.#newEntities;
    }

    public set newEntities(value: Entity[]) {
        this.#newEntities = value;
    }
}