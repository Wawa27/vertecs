import { assert } from "chai";
import SimpleCounterComponent from "./components/CounterComponent";
import CounterComponentSubclass from "./components/CounterComponentSubclass";
import Entity from "../src/core/Entity";
import Component from "../src/core/Component";
import EmptyComponent from "./components/EmptyComponent";

describe("Entity", () => {
    let entity: Entity;
    let simpleCounterComponent: Component;

    beforeEach(() => {
        entity = new Entity();
        simpleCounterComponent = new SimpleCounterComponent();
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
                const sameClassComponent = new SimpleCounterComponent();

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
                    entity.getComponent(SimpleCounterComponent)
                );
            });

            it("should return all the components requested", () => {
                entity.addComponent(simpleCounterComponent);
                const emptyComponent = new EmptyComponent();
                entity.addComponent(emptyComponent);

                const components = entity.getComponents([
                    SimpleCounterComponent,
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
                    SimpleCounterComponent,
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
                    SimpleCounterComponent,
                ]);

                assert.deepStrictEqual(
                    [emptyComponent, simpleCounterComponent],
                    components
                );
            });

            it("should return subclass component", () => {
                const counterComponentSubclass = new CounterComponentSubclass();
                entity.addComponent(counterComponentSubclass);

                const foundComponent = entity.getComponent(
                    SimpleCounterComponent
                );

                assert.deepStrictEqual(
                    foundComponent,
                    counterComponentSubclass
                );
            });
        });
    });

    describe("Hierarchy", () => {
        it("should call the onAddedToEntity method", () => {
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

        it("should remove the added components", () => {
            entity.addComponent(simpleCounterComponent);

            entity.removeComponent(SimpleCounterComponent);

            assert.equal(entity.components.length, 0);
        });

        it("should find a grandchild entity by its name ", () => {
            const entity = new Entity({
                children: [
                    new Entity({
                        name: "child",
                        children: [new Entity({ name: "grandchild" })],
                    }),
                ],
            });

            const nestedEntity = entity.findChildByName("grandchild");

            assert.isDefined(nestedEntity, "Grandchild entity not found");
            assert.equal(nestedEntity?.name, "grandchild");
        });
    });

    describe("ID", () => {
        it("should have the same ID", () => {
            const firstEntity = new Entity();
            const secondEntity = new Entity();

            assert.notEqual(firstEntity.id, secondEntity.id);
        });
    });

    describe("Clone", () => {
        it("should have the same name", () => {
            const firstEntity = new Entity({ name: "Clone test" });

            const clonedEntity = firstEntity.clone();

            assert.equal(clonedEntity.name, "Clone test");
        });

        it("should have the same number of components", () => {
            const firstEntity = new Entity({ name: "Clone test" });
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
            const firstEntity = new Entity({ name: "Clone test" });
            firstEntity.addChild(new Entity());
            firstEntity.addChild(new Entity());
            firstEntity.addChild(new Entity());

            const clonedEntity = firstEntity.clone();

            assert.equal(clonedEntity.children.length, 3);
        });
    });
});
