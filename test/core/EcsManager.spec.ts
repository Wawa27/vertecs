import { assert } from "chai";
import { EcsManager, Entity } from "../../src";
import CounterComponent from "../components/CounterComponent";
import CounterSystem from "./systems/CounterSystem";
import CounterComponentSubclass from "./components/CounterComponentSubclass";

describe("EcsManager", () => {
    describe("Eligibility", () => {
        it("should be eligible to the counter system", () => {
            const ecsManager = new EcsManager();
            const counterComponent = new CounterComponent();
            const counterSystem = new CounterSystem();

            const counterEntity = ecsManager.newEntity();

            counterEntity.addComponent(counterComponent);

            assert.isTrue(
                ecsManager.isEntityEligibleToGroup(
                    counterSystem.filter,
                    counterEntity
                )
            );
        });

        it("should allow use of component subclasses", () => {
            const ecsManager = new EcsManager();
            const counterSubclassComponent = new CounterComponentSubclass();
            const counterSystem = new CounterSystem();

            const counterEntity = ecsManager.newEntity();

            counterEntity.addComponent(counterSubclassComponent);

            assert.isTrue(
                ecsManager.isEntityEligibleToGroup(
                    counterSystem.filter,
                    counterEntity
                )
            );
        });
    });
});
