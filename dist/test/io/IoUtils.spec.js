import { assert } from "chai";
import { EcsManager, IoUtils } from "../../src";
import SerializableCounter from "./SerializableCounter";
describe("io", () => {
    const ecsManager = new EcsManager();
    const counterEntityJson = `{ "id": "0", "components": [[ "SerializableCounter", { "data": { "count": 4 }, "className": "SerializableCounter" } ] ] }`;
    const ComponentClasses = [SerializableCounter];
    describe("import", () => {
        it("should import the entity with the correct component", () => {
            const ecsManager = new EcsManager();
            const entity = IoUtils.import(ComponentClasses, counterEntityJson);
            assert.equal(entity.id, "0");
            assert.exists(entity.getComponent(SerializableCounter));
            assert.equal(entity.getComponent(SerializableCounter)?.count, 4);
        });
    });
    describe("export", () => {
        it("should export the entity", () => {
            const entityToExport = ecsManager.createEntity({ id: "0" });
            entityToExport.addComponent(new SerializableCounter(4, { id: "0" }));
            const exportedEntity = IoUtils.export(entityToExport);
            assert.deepEqual(JSON.parse(exportedEntity), JSON.parse(counterEntityJson));
        });
    });
});
