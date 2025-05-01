import { assert } from "chai";
import CounterComponent from "../components/CounterComponent";
import CounterComponentSubclass from "../core/components/CounterComponentSubclass";
import { Component, Entity } from "../../src/core";
import EmptyComponent from "./components/EmptyComponent";
import { EcsManager } from "../../src";

describe("Entity", () => {
    const ecsManager = new EcsManager();
    let entity: Entity;
    let simpleCounterComponent: Component;

    beforeEach(() => {
        entity = ecsManager.createEntity();
        simpleCounterComponent = new CounterComponent();
    });

    describe("Component", () => {
        describe("Add components", () => {
            it("should add a components", () => {
                entity.addComponent(simpleCounterComponent);

                assert.equal(entity.components.length, 1);
            });

            it("should not add the same components", () => {
                entity.addComponent(simpleCounterComponent);
                entity.addComponent(simpleCounterComponent);

                assert.equal(entity.components.length, 1);
            });

            it("should not add a components of the same class", () => {
                const sameClassComponent = new CounterComponent();

                entity.addComponent(simpleCounterComponent);
                entity.addComponent(sameClassComponent);

                assert.equal(entity.components.length, 1);
            });

            it("should add 2 different components", () => {
                const simpleComponent = new EmptyComponent();

                entity.addComponent(simpleCounterComponent);
                entity.addComponent(simpleComponent);

                assert.equal(entity.components.length, 2);
            });
        });

        describe("Get components", () => {
            it("should return the correct components", () => {
                entity.addComponent(simpleCounterComponent);
                entity.addComponent(new EmptyComponent());

                assert.equal(
                    simpleCounterComponent,
                    entity.getComponent(CounterComponent)
                );
            });

            it("should return all the components requested", () => {
                entity.addComponent(simpleCounterComponent);
                const emptyComponent = new EmptyComponent();
                entity.addComponent(emptyComponent);

                const components = entity.getComponents([
                    CounterComponent,
                    EmptyComponent,
                ]);

                assert.deepStrictEqual(
                    [simpleCounterComponent, emptyComponent],
                    components
                );
            });

            it("should return the components in the correct order when a components is not found", () => {
                entity.addComponent(simpleCounterComponent);

                const components = entity.getComponents([
                    EmptyComponent,
                    CounterComponent,
                ]);

                assert.deepStrictEqual(
                    [undefined, simpleCounterComponent],
                    components
                );
            });

            it("should return components in the same order as the filter parameter", () => {
                entity.addComponent(simpleCounterComponent);
                const emptyComponent = new EmptyComponent();
                entity.addComponent(emptyComponent);

                const components = entity.getComponents([
                    EmptyComponent,
                    CounterComponent,
                ]);

                assert.deepStrictEqual(
                    [emptyComponent, simpleCounterComponent],
                    components
                );
            });

            it("should return subclass component", () => {
                const counterComponentSubclass = new CounterComponentSubclass();
                entity.addComponent(counterComponentSubclass);

                const foundComponent = entity.getComponent(CounterComponent);

                assert.deepStrictEqual(
                    foundComponent,
                    counterComponentSubclass
                );
            });
        });
    });

    describe("Hierarchy", () => {
        it("should remove the added components", () => {
            entity.addComponent(simpleCounterComponent);

            entity.removeComponent(CounterComponent);

            assert.equal(entity.components.length, 0);
        });

        it("should add a child entity", () => {
            const testChildEntity = ecsManager.createEntity({
                name: "testChildEntity",
            });
            entity.addChild(testChildEntity);

            assert.equal(entity.children.length, 1);
            assert.equal(testChildEntity.parent, entity);
            assert.equal(testChildEntity.name, "testChildEntity");
        });

        it("should find a grandchild entity by its name ", () => {
            const entity = ecsManager.createEntity({
                children: [
                    ecsManager.createEntity({
                        name: "child",
                        children: [
                            ecsManager.createEntity({ name: "grandchild" }),
                        ],
                    }),
                ],
            });

            const nestedEntity = entity.findChildByName("grandchild");

            assert.isDefined(nestedEntity, "Grandchild entity not found");
            assert.equal(nestedEntity?.name, "grandchild");
        });

        it("should remove a child entity", () => {
            const testChildEntity = ecsManager.createEntity({
                name: "testChildEntity",
            });

            entity.addChild(testChildEntity);
            entity.removeChild(testChildEntity);

            assert.equal(entity.children.length, 0);
            assert.equal(testChildEntity.parent, undefined);
        });
    });

    describe("ID", () => {
        it("should not have the same ID", () => {
            const firstEntity = ecsManager.createEntity();
            const secondEntity = ecsManager.createEntity();

            assert.notEqual(firstEntity.id, secondEntity.id);
        });
    });

    describe("Clone", () => {
        it("should have the same name", () => {
            const firstEntity = ecsManager.createEntity({ name: "Clone test" });

            const clonedEntity = firstEntity.clone();

            assert.equal(clonedEntity.name, "Clone test");
        });

        it("should have the same number of components", () => {
            const firstEntity = ecsManager.createEntity({ name: "Clone test" });
            firstEntity.addComponent(
                new (class A extends Component {
                    public constructor() {
                        super();
                    }
                })()
            );
            firstEntity.addComponent(
                new (class B extends Component {
                    public constructor() {
                        super();
                    }
                })()
            );
            firstEntity.addComponent(
                new (class C extends Component {
                    public constructor() {
                        super();
                    }
                })()
            );

            const clonedEntity = firstEntity.clone();

            assert.equal(clonedEntity.components.length, 3);
        });

        it("should have the same number of children", () => {
            const firstEntity = ecsManager.createEntity({ name: "Clone test" });
            firstEntity.addChild(ecsManager.createEntity());
            firstEntity.addChild(ecsManager.createEntity());
            firstEntity.addChild(ecsManager.createEntity());

            const clonedEntity = firstEntity.clone();

            assert.equal(clonedEntity.children.length, 3);
        });
    });
});
