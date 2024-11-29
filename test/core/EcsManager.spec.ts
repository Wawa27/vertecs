import * as chaiModule from "chai";
import chaiSpies from "chai-spies";
import { EcsManager } from "../../src";
import CounterComponent from "../components/CounterComponent";
import CounterSystem from "./systems/CounterSystem";
import CounterComponentSubclass from "./components/CounterComponentSubclass";
import EmptyComponent from "./components/EmptyComponent";

const chai = { ...chaiModule };

// @ts-ignore
chaiSpies(chai, chai.util);

describe("EcsManager", () => {
    let ecsManager: EcsManager;

    describe("Eligibility", () => {
        beforeEach(() => {
            ecsManager = new EcsManager();
        });

        it("should be eligible to the counter system", () => {
            const counterSystem = new CounterSystem();
            const counterEntity = ecsManager.createEntity();
            const counterComponent = new CounterComponent();

            counterEntity.addComponent(counterComponent);

            chai.assert.isTrue(
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

            chai.assert.isTrue(
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

            chai.expect(spy).to.not.have.been.called();
        });
    });
});
