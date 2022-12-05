import { assert } from "chai";
import NetworkCounterSynchronizer from "./components/NetworkCounterSynchronizer";
import TestClientNetworkSystem from "./systems/TestClientNetworkSystem";
import TestClientHandler from "./systems/TestClientHandler";
import CounterComponent from "../components/CounterComponent";
import { Entity, EcsManager } from "../../src/core";
import { ServerNetworkSystem } from "../../src";

describe("Networking", () => {
    const allowedNetworkComponents = [NetworkCounterSynchronizer];
    let serverNetworkSystem: ServerNetworkSystem;
    const serverEcsManager = new EcsManager();
    let clientNetworkSystem: TestClientNetworkSystem;
    const clientEcsManager = new EcsManager();

    it("should start server", async () => {
        serverNetworkSystem = new ServerNetworkSystem(
            allowedNetworkComponents,
            TestClientHandler
        );
        await serverEcsManager.addSystem(serverNetworkSystem);
        await serverEcsManager.start();
    });

    it("should connect to server", async () => {
        // Make sure the server is started before connecting
        // eslint-disable-next-line no-promise-executor-return
        await new Promise((resolve) => setTimeout(resolve, 250));

        clientNetworkSystem = new TestClientNetworkSystem(
            allowedNetworkComponents,
            "ws://localhost:10025"
        );
        await clientEcsManager.addSystem(clientNetworkSystem);
        await clientEcsManager.start();

        // Make sure the client is connected
        // eslint-disable-next-line no-promise-executor-return
        await new Promise((resolve) => setTimeout(resolve, 250));

        assert.isTrue(clientNetworkSystem.isConnected);
    });

    it("should send the newly created entity to client", async () => {
        const newServerEntity = new Entity();
        newServerEntity.addComponent(new CounterComponent());
        newServerEntity.addComponent(new NetworkCounterSynchronizer());

        await serverEcsManager.addEntity(newServerEntity);

        // Make sure the entity is sent
        // eslint-disable-next-line no-promise-executor-return
        await new Promise((resolve) => setTimeout(resolve, 1250));
        const newClientEntity = clientNetworkSystem.newEntities[0];

        assert.equal(clientNetworkSystem.newEntities.length, 1);
        assert.exists(newClientEntity);
        assert.equal(newClientEntity.getComponent(CounterComponent)!.count, 0);
    });

    it("should update and send the new count", async () => {
        // Make sure the entity is sent
        // eslint-disable-next-line no-promise-executor-return
        await new Promise((resolve) => setTimeout(resolve, 1250));
        const newClientEntity = clientNetworkSystem.newEntities[0];

        assert.equal(clientNetworkSystem.newEntities.length, 1);
        assert.exists(newClientEntity);
        assert.equal(newClientEntity.getComponent(CounterComponent)!.count, 1);
    });
});
