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
    const allowedNetworkComponents = [NetworkCounter, IsPrefab];

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
            TestClientHandler,
            undefined,
            undefined,
            8092
        );
        await serverEcsManager.addSystem(serverNetworkSystem);

        const serverTestPrefab = PrefabManager.get("testPrefab");
        serverTestPrefab?.addComponent(new IsNetworked());
        serverEcsManager.addEntity(serverTestPrefab!);

        clientANetworkSystem = new TestClientNetworkSystem(
            allowedNetworkComponents,
            "ws://localhost:8092"
        );
        await clientAEcsManager.addSystem(clientANetworkSystem);

        await serverEcsManager.start();
        await clientAEcsManager.start();
    });

    it("should send prefab to client", async () => {
        await new Promise((resolve) => setTimeout(resolve, 300));

        const prefabEntity = clientANetworkSystem.entities.find((entity) =>
            entity.hasComponent(IsPrefab)
        );

        assert.exists(prefabEntity);
        assert.equal(
            prefabEntity!.getComponent(IsPrefab)?.prefabName,
            "testPrefab"
        );
        assert.equal(prefabEntity!.getComponent(CounterComponent)?.count, 0);
    });

    it("should instantiate the entity from the prefab on deserialization", () => {
        const template = new Entity({ name: "instantiateMe" });
        template.addComponent(new NetworkCounter());
        PrefabManager.set("instantiateMe", template);

        const target = new Entity();
        const isPrefab = new IsPrefab();
        target.addComponent(isPrefab);
        isPrefab.read("instantiateMe");

        assert.equal(target.name, "instantiateMe");
        assert.equal(
            target.getComponent(IsPrefab)?.prefabName,
            "instantiateMe"
        );
        assert.exists(target.getComponent(CounterComponent));
        assert.exists(target.getComponent(NetworkCounter));
    });

    it("should instantiate the entity on onAddedToEntity when added to a world entity", () => {
        const template = new Entity({ name: "worldPrefab" });
        template.addComponent(new NetworkCounter());
        PrefabManager.set("worldPrefab", template);

        const target = new EcsManager().createEntity();
        target.addComponent(new IsPrefab("worldPrefab"));

        assert.equal(target.getComponent(IsPrefab)?.prefabName, "worldPrefab");
        assert.exists(target.getComponent(CounterComponent));
        assert.exists(target.getComponent(NetworkCounter));
    });

    after(async () => {
        await serverEcsManager.stop();
        await clientAEcsManager.stop();
    });
});
