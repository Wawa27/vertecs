import { assert } from "chai";
import { EcsManager } from "../../src/core";
import {
    FiniteStateMachine,
    FiniteStateMachineSystem,
    TimedState,
    TimedStateSystem,
} from "../../src";

class TimedStateTest1 extends TimedState {
    public constructor() {
        super(1000, 1, "test2");
    }
}

class TimedStateTest2 extends TimedState {
    public constructor() {
        super(1000, 1, "test3");
    }
}

class TimedStateTest3 extends TimedState {
    public constructor() {
        super(1000, 1, "test1");
    }
}

describe("FiniteStateMachine", async () => {
    const ecsManager = new EcsManager();

    before(async () => {
        const entity = ecsManager.createEntity();
        const finiteStateMachine = new FiniteStateMachine(
            "test1",
            [
                { name: "test1", state: new TimedStateTest1() },
                { name: "test2", state: new TimedStateTest2() },
                { name: "test3", state: new TimedStateTest3() },
            ],
            [
                { stateName: "test1", nextStateNames: ["test2"] },
                { stateName: "test2", nextStateNames: ["test3"] },
                { stateName: "test3", nextStateNames: ["test1"] },
            ]
        );
        entity.addComponent(finiteStateMachine);

        ecsManager.addSystem(new FiniteStateMachineSystem());
        ecsManager.addSystem(new TimedStateSystem());

        await ecsManager.start();
    });

    describe("TimedState", async () => {
        it("should start in state test1", async () => {
            const entity = ecsManager.entities[0];
            const finiteStateMachine = entity.getComponent(FiniteStateMachine);
            assert.equal(finiteStateMachine?.currentStateName, "test1");
        });

        it("should transition to next state test2", async () => {
            await new Promise((resolve) => setTimeout(resolve, 1100));
            const entity = ecsManager.entities[0];
            const finiteStateMachine = entity.getComponent(FiniteStateMachine);
            assert.equal(finiteStateMachine?.currentStateName, "test2");
        });

        it("should transition to next state test3", async () => {
            await new Promise((resolve) => setTimeout(resolve, 1100));
            const entity = ecsManager.entities[0];
            const finiteStateMachine = entity.getComponent(FiniteStateMachine);
            assert.equal(finiteStateMachine?.currentStateName, "test3");
        });
    });
});
