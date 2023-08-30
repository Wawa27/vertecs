import { ComponentClass } from "../../../src/core/Component";
import { Entity } from "../../../src/core";
import { ClientNetworkSystem } from "../../../src";

export default class TestClientNetworkSystem extends ClientNetworkSystem {
    #isConnected: boolean;

    #newEntities: Entity[];

    #lastCustomData: any;

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

    protected onDisconnect(): void {
        this.#isConnected = false;
    }

    protected onCustomData(customPrivateData: any) {
        this.#lastCustomData = customPrivateData;
    }

    protected onNewEntity(entity: Entity): void {
        this.#newEntities.push(entity);
    }

    protected onDeletedEntity(entity: Entity): void {
        this.#newEntities = this.#newEntities.filter(
            (newEntity) => newEntity.id !== entity.id
        );
    }

    public get lastCustomData(): any {
        return this.#lastCustomData;
    }

    public get isConnected(): boolean {
        return this.#isConnected;
    }

    public set isConnected(value: boolean) {
        this.#isConnected = value;
    }

    public get entities(): Entity[] {
        return this.#newEntities;
    }

    public set entities(value: Entity[]) {
        this.#newEntities = value;
    }

    public get serverSnapshot(): any {
        return this.$serverSnapshot;
    }

    public set serverSnapshot(value: any) {
        this.$serverSnapshot = value;
    }
}
