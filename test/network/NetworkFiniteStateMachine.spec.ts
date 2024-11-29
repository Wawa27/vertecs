import { assert } from "chai";
import {
    EcsManager,
    Entity,
    FiniteStateMachine,
    FiniteStateMachineSystem,
    IsNetworked,
    PrefabManager,
    ServerNetworkSystem,
    State,
    TimedState,
    TimedStateSystem,
} from "../../src";
import TestClientNetworkSystem from "./systems/TestClientNetworkSystem";
import TestClientHandler from "./systems/TestClientHandler";

class TimedStateTest1 extends TimedState {
    public constructor() {
        super(1000, 1, "test2");
    }
}

class StateTest2 extends State {
    public constructor() {
        super();
    }
}

class StateTest3 extends State {
    public constructor() {
        super();
    }
}

describe("FiniteStateMachine", async () => {
    const allowedNetworkComponents = [FiniteStateMachine];

    let serverNetworkSystem: ServerNetworkSystem;
    const serverEcsManager = new EcsManager();
    let serverEntity;

    let clientANetworkSystem: TestClientNetworkSystem;
    const clientAEcsManager = new EcsManager();

    before(async () => {
        serverNetworkSystem = new ServerNetworkSystem(
            allowedNetworkComponents,
            TestClientHandler
        );

        await serverEcsManager.addSystem(serverNetworkSystem);
        await serverEcsManager.addSystem(new FiniteStateMachineSystem());
        await serverEcsManager.addSystem(new TimedStateSystem());
        await serverEcsManager.start();

        Object.assign(global, { WebSocket: (await import("ws")).WebSocket });

        clientANetworkSystem = new TestClientNetworkSystem(
            allowedNetworkComponents,
            "ws://localhost:8080"
        );
        await clientAEcsManager.addSystem(clientANetworkSystem);
        await clientAEcsManager.addSystem(new FiniteStateMachineSystem());
        await clientAEcsManager.addSystem(new TimedStateSystem());

        const testPrefab = new Entity();
        const finiteStateMachine = new FiniteStateMachine(
            "test1",
            [
                { name: "test1", state: new TimedStateTest1() },
                { name: "test2", state: new StateTest2() },
                { name: "test3", state: new StateTest3() },
            ],
            [
                { stateName: "test1", nextStateNames: ["test2"] },
                { stateName: "test2", nextStateNames: ["test3"] },
                { stateName: "test3", nextStateNames: ["test1"] },
            ]
        );
        testPrefab.addComponent(finiteStateMachine);
        PrefabManager.set("testPrefab", testPrefab);

        serverEntity = PrefabManager.get("testPrefab");
        if (!serverEntity) throw new Error("Prefab not found");
        serverEntity.addComponent(new IsNetworked());
        serverEcsManager.addEntity(serverEntity);

        await clientAEcsManager.start();
    });

    it("should start with state1", async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));

        const clientAEntity = clientAEcsManager.entities.find((entity) =>
            entity.hasComponent(FiniteStateMachine)
        );
        const finiteStateMachine =
            clientAEntity!.getComponent(FiniteStateMachine);

        assert.equal(finiteStateMachine?.currentStateName, "test1");
    });

    it("should move to state2 after a second", async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const clientAEntity = clientAEcsManager.entities.find((entity) =>
            entity.hasComponent(FiniteStateMachine)
        );
        const clientAFiniteStateMachine =
            clientAEntity!.getComponent(FiniteStateMachine);
        const serverFiniteStateMachine =
            serverEcsManager.entities[0].getComponent(FiniteStateMachine);

        assert.equal(clientAFiniteStateMachine?.currentStateName, "test2");
        assert.equal(serverFiniteStateMachine?.currentStateName, "test2");
    });

    it("should move to state3 after server moves to state3", async () => {
        const serverFiniteStateMachine = serverEcsManager.entities
            .find((entity) => entity.hasComponent(FiniteStateMachine))!
            .getComponent(FiniteStateMachine);

        serverFiniteStateMachine?.setNextState("test3");

        await new Promise((resolve) => setTimeout(resolve, 100));

        const clientAEntity = clientAEcsManager.entities[0];
        const clientAFiniteStateMachine =
            clientAEntity.getComponent(FiniteStateMachine);

        assert.equal(clientAFiniteStateMachine?.currentStateName, "test3");
    });

    after(async () => {
        await serverEcsManager.stop();
        await clientAEcsManager.stop();
    });
});
