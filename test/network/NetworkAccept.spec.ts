import { assert } from "chai";
import NetworkCounter from "./components/NetworkCounter";
import RejectingCounter from "./components/RejectingCounter";
import TestClientNetworkSystem from "./systems/TestClientNetworkSystem";
import TestClientHandler from "./systems/TestClientHandler";
import { EcsManager } from "../../src/core";
import { IsNetworked, ServerNetworkSystem } from "../../src";
import CounterComponent from "../components/CounterComponent";

describe("Networking accept authority", async () => {
    const allowedNetworkComponents = [NetworkCounter, RejectingCounter];

    let serverNetworkSystem: ServerNetworkSystem;
    const serverEcsManager = new EcsManager();

    let clientNetworkSystem: TestClientNetworkSystem;
    const clientEcsManager = new EcsManager();

    before(async () => {
        serverNetworkSystem = new ServerNetworkSystem(
            allowedNetworkComponents,
            TestClientHandler,
            undefined,
            undefined,
            8093
        );
        await serverEcsManager.addSystem(serverNetworkSystem);
        await serverEcsManager.start();

        await new Promise((resolve) => setTimeout(resolve, 250));

        clientNetworkSystem = new TestClientNetworkSystem(
            allowedNetworkComponents,
            "ws://localhost:8093"
        );
        await clientEcsManager.addSystem(clientNetworkSystem);
        await clientEcsManager.start();
        await new Promise((resolve) => setTimeout(resolve, 250));
    });

    it("should reject a client update the component does not accept", async () => {
        const ownerId = clientNetworkSystem.networkId!;
        const entity = serverEcsManager.createEntity();
        entity.addComponent(new IsNetworked(ownerId, "public"));
        entity.addComponent(new RejectingCounter());

        // Wait for the client to receive and spawn the entity.
        await new Promise((resolve) => setTimeout(resolve, 250));
        const clientEntity = clientNetworkSystem.entities.find(
            (e) => e.id === entity.id
        );
        assert.exists(clientEntity);
        assert.equal(clientEntity!.getComponent(CounterComponent)?.count, 0);

        // Client modifies its local copy and sends the update.
        clientEntity!.getComponent(CounterComponent)!.increment();
        await new Promise((resolve) => setTimeout(resolve, 250));

        // The server must have rejected the update: its counter stays at 0.
        assert.equal(entity.getComponent(CounterComponent)?.count, 0);
        // The rejected optimistic update is corrected by the server.
        assert.equal(clientEntity!.getComponent(CounterComponent)?.count, 0);
    });

    after(async () => {
        await serverEcsManager.stop();
        await clientEcsManager.stop();
    });
});
