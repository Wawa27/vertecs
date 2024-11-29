import { assert } from "chai";
import NetworkCounter from "./components/NetworkCounter";
import TestClientNetworkSystem from "./systems/TestClientNetworkSystem";
import TestClientHandler from "./systems/TestClientHandler";
import { EcsManager } from "../../src/core";
import {
    Entity,
    IsNetworked,
    IsPrefab,
    PrefabManager,
    ServerNetworkSystem,
} from "../../src";
import CounterComponent from "../components/CounterComponent";

describe("Prefabs", async () => {
    const allowedNetworkComponents = [NetworkCounter];

    let serverNetworkSystem: ServerNetworkSystem;
    const serverEcsManager = new EcsManager();

    let clientANetworkSystem: TestClientNetworkSystem;
    const clientAEcsManager = new EcsManager();

    before(async () => {
        const testPrefab = new Entity({ name: "testPrefab" });
        testPrefab.addComponent(new NetworkCounter());
        testPrefab.addComponent(new IsPrefab("testPrefab"));
        PrefabManager.set("testPrefab", testPrefab);

        serverNetworkSystem = new ServerNetworkSystem(
            allowedNetworkComponents,
            TestClientHandler
        );
        await serverEcsManager.addSystem(serverNetworkSystem);

        const serverTestPrefab = PrefabManager.get("testPrefab");
        serverTestPrefab?.addComponent(new IsNetworked());

        clientANetworkSystem = new TestClientNetworkSystem(
            allowedNetworkComponents,
            "ws://localhost:8080"
        );
        await clientAEcsManager.addSystem(clientANetworkSystem);

        await serverEcsManager.start();
        await clientAEcsManager.start();
    });

    it("should send prefab to client", async () => {
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

    after(async () => {
        await serverEcsManager.stop();
        await clientAEcsManager.stop();
    });
});
