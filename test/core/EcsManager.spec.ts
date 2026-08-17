import * as chaiModule from "chai";
import chaiSpies from "chai-spies";
import { EcsManager } from "../../src";
import CounterComponent from "../components/CounterComponent";
import CounterSystem from "./systems/CounterSystem";
import CounterComponentSubclass from "./components/CounterComponentSubclass";
import EmptyComponent from "./components/EmptyComponent";

const chai = chaiModule.use(chaiSpies);
const { expect } = chai;

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

            expect(
                ecsManager.isEntityEligibleToGroup(
                    counterSystem.filter,
                    counterEntity
                )
            ).to.equal(true);
        });

        it("should allow use of component subclasses", () => {
            const counterSubclassComponent = new CounterComponentSubclass();
            const counterSystem = new CounterSystem();

            const counterEntity = ecsManager.createEntity();

            counterEntity.addComponent(counterSubclassComponent);

            expect(
                ecsManager.isEntityEligibleToGroup(
                    counterSystem.filter,
                    counterEntity
                )
            ).to.equal(true);
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
