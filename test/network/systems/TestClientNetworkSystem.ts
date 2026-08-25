import { ComponentClass } from "../../../src/core/Component";
import { Entity } from "../../../src/core";
import { ClientNetworkSystem, CommandHandler } from "../../../src";
import TestMessageCommand from "../commands/TestMessageCommand";

export default class TestClientNetworkSystem extends ClientNetworkSystem {
    #isConnected: boolean;

    #newEntities: Entity[];

    #lastCommand: any;

    public constructor(
        allowedNetworkComponents: ComponentClass[],
        address: string
    ) {
        super(allowedNetworkComponents, address);
        this.#isConnected = false;
        this.#newEntities = [];
        this.registerCommandHandler(new TestMessageCommandHandler(this));
    }

    protected onConnect(): void {
        this.#isConnected = true;
    }

    protected onDisconnect(): void {
        this.#isConnected = false;
    }

    protected onNewEntity(entity: Entity): void {
        this.#newEntities.push(entity);
    }

    protected onDeletedEntity(entity: Entity): void {
        this.#newEntities = this.#newEntities.filter(
            (newEntity) => newEntity.id !== entity.id
        );
    }

    public get lastCommand(): any {
        return this.#lastCommand;
    }

    public set lastCommand(value: any) {
        this.#lastCommand = value;
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
        const snapshot = value;
        snapshot.commands.forEach((command: any) => {
            this.$serverSnapshot.commands.push(command);
        });
        snapshot.entities.forEach((entity: any, id: string) => {
            this.$serverSnapshot.entities.set(id, entity);
        });
    }
}

class TestMessageCommandHandler extends CommandHandler<TestMessageCommand> {
    #system: TestClientNetworkSystem;

    public constructor(system: TestClientNetworkSystem) {
        super(TestMessageCommand, TestMessageCommand.TYPE);
        this.#system = system;
    }

    public execute(command: TestMessageCommand): void {
        this.#system.lastCommand = command.message;
    }
}
