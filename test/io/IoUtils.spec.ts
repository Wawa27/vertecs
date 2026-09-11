import { assert } from "chai";
import { EcsManager, IoUtils } from "../../src";
import SerializableCounter from "./SerializableCounter";
import counterEntityJson from "./counterEntity.json";

describe("io", () => {
    const ecsManager = new EcsManager();
    const ComponentClasses = [SerializableCounter];

    describe("import", () => {
        it("should import the entity with the correct component", () => {
            const ecsManager = new EcsManager();

            const entity = IoUtils.import(
                ComponentClasses,
                JSON.stringify(counterEntityJson)
            );

            assert.equal(entity.id, "0");
            assert.exists(entity.getComponent(SerializableCounter));
            assert.equal(entity.getComponent(SerializableCounter)?.count, 4);
        });
    });

    describe("export", () => {
        it("should export the entity", () => {
            const entityToExport = ecsManager.createEntity({ id: "0" });
            entityToExport.addComponent(
                new SerializableCounter(4, { id: "0" })
            );

            const exportedEntity = IoUtils.export(entityToExport);

            assert.deepEqual(JSON.parse(exportedEntity), counterEntityJson);
        });
    });

    describe("exportTree", () => {
        it("should export the entity and its direct children", () => {
            const parent = ecsManager.createEntity({ id: "10" });
            parent.addComponent(new SerializableCounter(1, { id: "10" }));
            const child = ecsManager.createEntity({ id: "11", parent });
            child.addComponent(new SerializableCounter(2, { id: "11" }));

            const exported = IoUtils.exportTree(parent);

            assert.lengthOf(exported, 2);
            assert.deepEqual(JSON.parse(exported[0]), {
                id: "10",
                components: [
                    [
                        "SerializableCounter",
                        {
                            className: "SerializableCounter",
                            data: { count: 1 },
                        },
                    ],
                ],
                tags: [],
            });
            assert.deepEqual(JSON.parse(exported[1]), {
                id: "11",
                components: [
                    [
                        "SerializableCounter",
                        {
                            className: "SerializableCounter",
                            data: { count: 2 },
                        },
                    ],
                ],
                parentId: "10",
                tags: [],
            });
        });

        it("should export all descendants recursively", () => {
            const parent = ecsManager.createEntity({ id: "20" });
            const child = ecsManager.createEntity({ id: "21", parent });
            const grandchild = ecsManager.createEntity({
                id: "22",
                parent: child,
            });
            ecsManager.createEntity({ id: "23", parent: grandchild });

            const exported = IoUtils.exportTree(parent);

            assert.lengthOf(exported, 4);
        });

        it("should return only the entity when it has no children", () => {
            const entity = ecsManager.createEntity({ id: "30" });

            const exported = IoUtils.exportTree(entity);

            assert.lengthOf(exported, 1);
            assert.deepEqual(JSON.parse(exported[0]).id, "30");
        });
    });

    describe("importTree", () => {
        it("should import all entities in the same order as exportTree", () => {
            const parent = ecsManager.createEntity({ id: "40" });
            const child = ecsManager.createEntity({ id: "41", parent });
            ecsManager.createEntity({
                id: "42",
                parent: child,
            });

            const imported = IoUtils.importTree(
                ComponentClasses,
                IoUtils.exportTree(parent)
            );

            assert.lengthOf(imported, 3);
            assert.equal(imported[0].id, "40");
            assert.equal(imported[1].id, "41");
            assert.equal(imported[2].id, "42");
        });

        it("should restore the parent/child hierarchy", () => {
            const parent = ecsManager.createEntity({
                id: "50",
                name: "parent",
            });
            ecsManager.createEntity({
                id: "51",
                parent,
                name: "child",
            });

            const imported = IoUtils.importTree(
                ComponentClasses,
                IoUtils.exportTree(parent)
            );

            assert.equal(imported[0].name, "parent");
            assert.equal(imported[1].name, "child");
            assert.equal(imported[1].parent?.id, "50");
            assert.equal(imported[0].children[0].id, "51");
        });

        it("should restore components on every imported entity", () => {
            const parent = ecsManager.createEntity({ id: "60" });
            parent.addComponent(new SerializableCounter(3, { id: "60" }));
            const child = ecsManager.createEntity({ id: "61", parent });
            child.addComponent(new SerializableCounter(5, { id: "61" }));

            const imported = IoUtils.importTree(
                ComponentClasses,
                IoUtils.exportTree(parent)
            );

            assert.equal(
                imported[0].getComponent(SerializableCounter)?.count,
                3
            );
            assert.equal(
                imported[1].getComponent(SerializableCounter)?.count,
                5
            );
        });

        it("should import a single entity with a null parent", () => {
            const entity = ecsManager.createEntity({ id: "70" });
            entity.addComponent(new SerializableCounter(7, { id: "70" }));

            const imported = IoUtils.importTree(
                ComponentClasses,
                IoUtils.exportTree(entity)
            );

            assert.lengthOf(imported, 1);
            assert.equal(imported[0].id, "70");
            assert.equal(imported[0].parent, undefined);
            assert.equal(
                imported[0].getComponent(SerializableCounter)?.count,
                7
            );
        });

        it("should return an empty array when given no entities", () => {
            const imported = IoUtils.importTree(ComponentClasses, []);

            assert.lengthOf(imported, 0);
        });
    });
});
