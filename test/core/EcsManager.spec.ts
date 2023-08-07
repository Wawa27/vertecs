import chai, { assert, expect } from "chai";
import spies from "chai-spies";
import { EcsManager, Entity } from "../../src";
import CounterComponent from "../components/CounterComponent";
import CounterSystem from "./systems/CounterSystem";
import CounterComponentSubclass from "./components/CounterComponentSubclass";
import EmptyComponent from "./components/EmptyComponent";

chai.use(spies);

describe("EcsManager", () => {
    describe("Eligibility", () => {
        let ecsManager: EcsManager;

        beforeEach(() => {
            ecsManager = new EcsManager();
        });

        it("should be eligible to the counter system", () => {
            const counterSystem = new CounterSystem();
            const counterEntity = ecsManager.createEntity();
            const counterComponent = new CounterComponent();

            counterEntity.addComponent(counterComponent);

            assert.isTrue(
                ecsManager.isEntityEligibleToGroup(
                    counterSystem.filter,
                    counterEntity
                )
            );
        });

        it("should allow use of component subclasses", () => {
            const counterSubclassComponent = new CounterComponentSubclass();
            const counterSystem = new CounterSystem();

            const counterEntity = ecsManager.createEntity();

            counterEntity.addComponent(counterSubclassComponent);

            assert.isTrue(
                ecsManager.isEntityEligibleToGroup(
                    counterSystem.filter,
                    counterEntity
                )
            );
        });

        it("should not call onEntityNoLongerEligible for unrelated component removal", () => {
            const counterSystem = new CounterSystem();

            const counterEntity = ecsManager.createEntity();

            const spy = chai.spy.on(counterSystem, "onEntityNoLongerEligible");

            counterEntity.addComponent(new EmptyComponent()); // Add unrelated component
            counterEntity.removeComponent(EmptyComponent); // Remove unrelated component

            expect(spy).to.not.have.been.called();
        });
    });
});
