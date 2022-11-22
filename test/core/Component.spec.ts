import { assert } from "chai";
import Entity from "../../src/core/Entity";
import Component from "../../src/core/Component";
import SimpleComponent from "../core/components/SimpleComponent";
import AttachCounter from "../core/components/AttachCounter";

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
