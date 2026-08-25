import { assert } from "chai";
import NetworkCounter from "./components/NetworkCounter";
import TestClientNetworkSystem from "./systems/TestClientNetworkSystem";
import TestClientHandler from "./systems/TestClientHandler";
import CounterComponent from "../components/CounterComponent";
import TestMessageCommand from "./commands/TestMessageCommand";
import { EcsManager } from "../../src/core";
import { CommandHandler, IsNetworked, ServerNetworkSystem } from "../../src";

describe("Networking", async () => {
    const allowedNetworkComponents = [NetworkCounter];

    let serverNetworkSystem: ServerNetworkSystem;
    const serverEcsManager = new EcsManager();

    let clientANetworkSystem: TestClientNetworkSystem;
    const clientAEcsManager = new EcsManager();

    let clientBNetworkSystem: TestClientNetworkSystem;
    const clientBEcsManager = new EcsManager();

    it("should start server", async () => {
        serverNetworkSystem = new ServerNetworkSystem(
            allowedNetworkComponents,
            TestClientHandler,
            undefined,
            undefined,
            8090
        );

        await serverEcsManager.addSystem(serverNetworkSystem);
        await serverEcsManager.start();

        assert.ok(serverNetworkSystem.hasStarted);
    });

    it("should connect to server", async () => {
        Object.assign(global, { WebSocket: (await import("ws")).WebSocket });
        // Make sure the server is started before connecting

        await new Promise((resolve) => setTimeout(resolve, 250));
        clientANetworkSystem = new TestClientNetworkSystem(
            allowedNetworkComponents,
            "ws://localhost:8090"
        );
        await clientAEcsManager.addSystem(clientANetworkSystem);
        await clientAEcsManager.start();
        await new Promise((resolve) => setTimeout(resolve, 250));

        assert.isTrue(clientANetworkSystem.isConnected);
        assert.exists(clientANetworkSystem.networkId);
    });

    it("should send the newly created entity to client", async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        const newClientEntity = clientANetworkSystem.entities[0];

        assert.equal(clientANetworkSystem.entities.length, 1);
        assert.exists(newClientEntity);
        assert.equal(newClientEntity.getComponent(CounterComponent)?.count, 0);
        assert.equal(
            newClientEntity.getComponent(IsNetworked)?.ownerId,
            clientANetworkSystem.networkId
        );
    });

    it("should update and send the new count", async () => {
        const clientACounterEntity = clientANetworkSystem.entities[0];
        const serverCounterComponent =
            serverEcsManager.entities[0].getComponent(CounterComponent);

        serverCounterComponent?.increment();
        await new Promise((resolve) => setTimeout(resolve, 100));

        assert.equal(clientANetworkSystem.entities.length, 1);
        assert.exists(clientACounterEntity);
        assert.equal(
            clientACounterEntity.getComponent(CounterComponent)?.count,
            1
        );
    });

    it("should send all up to date entities to new clients", async () => {
        clientBNetworkSystem = new TestClientNetworkSystem(
            allowedNetworkComponents,
            "ws://localhost:8090"
        );
        await clientBEcsManager.addSystem(clientBNetworkSystem);

        await clientBEcsManager.start();
        await new Promise((resolve) => setTimeout(resolve, 250));

        const newClientEntity = clientBNetworkSystem.entities[0];
        assert.equal(clientBNetworkSystem.entities.length, 2);
        assert.exists(newClientEntity);
        assert.equal(newClientEntity.getComponent(CounterComponent)?.count, 1);
    });

    it("should allow clientA to update the count", async () => {
        const newClientEntity = clientANetworkSystem.entities[0];
        const counterComponent = newClientEntity.getComponent(CounterComponent);
        const clientBCounterComponent =
            clientBNetworkSystem.entities[0].getComponent(CounterComponent);
        const serverCounterComponent =
            serverEcsManager.entities[0].getComponent(CounterComponent);

        counterComponent?.increment();
        await new Promise((resolve) => setTimeout(resolve, 100));

        assert.equal(counterComponent?.count, 2);
        assert.equal(serverCounterComponent?.count, 2);

        assert.equal(clientBCounterComponent?.count, 2);
    });

    it("should not allow clientB to update the count", async () => {
        const newClientEntity = clientBNetworkSystem.entities[0];
        const counterComponent = newClientEntity.getComponent(CounterComponent);
        const serverCounterComponent =
            serverEcsManager.entities[0].getComponent(CounterComponent);

        counterComponent?.increment();
        await new Promise((resolve) => setTimeout(resolve, 100));

        assert.equal(counterComponent?.count, 3);
        assert.equal(serverCounterComponent?.count, 2);
    });

    it("should dispatch a client command on the server and echo it back", async () => {
        serverNetworkSystem.registerCommandHandler(
            new (class extends CommandHandler<TestMessageCommand> {
                public constructor() {
                    super(TestMessageCommand, TestMessageCommand.TYPE);
                }

                public accept(command: TestMessageCommand): boolean {
                    return command.message.length > 0;
                }

                public execute(command: TestMessageCommand): void {
                    serverNetworkSystem.broadcastCommand(
                        new TestMessageCommand(`echo:${command.message}`)
                    );
                }
            })()
        );

        clientANetworkSystem.sendCommand(new TestMessageCommand("ping"));
        await new Promise((resolve) => setTimeout(resolve, 100));

        assert.equal(clientBNetworkSystem.lastCommand, "echo:ping");
        assert.equal(clientANetworkSystem.lastCommand, "echo:ping");
    });

    it("should disconnect clientA and remove clientA entity from server", async () => {
        await clientAEcsManager.stop();

        await new Promise((resolve) => setTimeout(resolve, 100));

        assert.isFalse(clientANetworkSystem.isConnected);
    });

    it("should remove clientA entity from clientB", async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));

        assert.equal(serverEcsManager.entities.length, 1);
        assert.equal(clientBNetworkSystem.entities.length, 1);
    });

    it("should send private command to clientB", async () => {
        const message = "Hello, client B!";
        serverNetworkSystem.sendCommandToClient(
            clientBNetworkSystem.networkId ?? "",
            new TestMessageCommand(message)
        );
        await new Promise((resolve) => setTimeout(resolve, 100));

        assert.equal(clientBNetworkSystem.lastCommand, message);
        assert.notEqual(clientANetworkSystem.lastCommand, message);
    });

    after(async () => {
        await serverEcsManager.stop();
        await clientBEcsManager.stop();
    });
});
