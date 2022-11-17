import { assert } from "chai";
import AttachCounter from "test/core/components/AttachCounter";
import Entity from "src/core/Entity";
import Component from "src/core/Component";
import SimpleComponent from "test/core/components/SimpleComponent";

describe("Component", () => {
    describe("ID", () => {
        it("should not have the same ID", () => {
            const firstComponent = new SimpleComponent();
            const secondComponent = new SimpleComponent();

            assert.notEqual(firstComponent.id, secondComponent.id);
        });

        it("should call onAttachedToEntity", () => {
            const component = new AttachCounter();
            const entity = new Entity();

            entity.addComponent(component);

            assert.equal(component.counter, 1);
        });
    });
});
