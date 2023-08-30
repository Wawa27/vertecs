import { assert } from "chai";
import SimpleComponent from "../core/components/SimpleComponent";
import AttachCounter from "../core/components/AttachCounter";
import { Component, EcsManager } from "../../src";

describe("Component", () => {
    const ecsManager = new EcsManager();

    describe("ID", () => {
        it("should not have the same ID", () => {
            const firstComponent = new SimpleComponent();
            const secondComponent = new SimpleComponent();

            assert.notEqual(firstComponent.id, secondComponent.id);
        });
    });

    describe("Callbacks", () => {
        it("should call onAttachedToEntity", () => {
            const component = new AttachCounter();
            const entity = ecsManager.createEntity();

            entity.addComponent(component);

            assert.equal(component.counter, 1);
        });

        it("should call the onAddedToEntity method", () => {
            const entity = ecsManager.createEntity();
            let pass = false;
            entity.addComponent(
                new (class extends Component {
                    public constructor() {
                        super();
                    }

                    onAddedToEntity() {
                        pass = true;
                    }
                })()
            );
            assert.isTrue(pass);
        });
    });
});
