import { assert } from "chai";
import { Entity, IoUtils, PrefabManager } from "../../src";
import IsPrefab from "../../src/utils/prefabs/IsPrefab";
import SerializableCounter from "../components/SerializableCounter";
import NetworkCounter from "../network/components/NetworkCounter";

describe("PrefabManager", () => {
    it("should append components when two prefabs share the same name", () => {
        const base = new Entity({ name: "mergedPrefab" });
        base.addComponent(new SerializableCounter(1));
        PrefabManager.set("mergedPrefab", base);

        const extra = new Entity({ name: "mergedPrefab" });
        extra.addComponent(new NetworkCounter());
        PrefabManager.set("mergedPrefab", extra);

        const merged = PrefabManager.get("mergedPrefab");
        assert.exists(merged);
        assert.exists(merged!.getComponent(SerializableCounter));
        assert.exists(merged!.getComponent(NetworkCounter));
        assert.equal(
            merged!.getComponent(IsPrefab)?.prefabName,
            "mergedPrefab"
        );
    });

    it("should replace same-class components when appending", () => {
        const base = new Entity({ name: "overridePrefab" });
        base.addComponent(new SerializableCounter(1));
        PrefabManager.set("overridePrefab", base);

        const extra = new Entity({ name: "overridePrefab" });
        extra.addComponent(new SerializableCounter(99));
        PrefabManager.set("overridePrefab", extra);

        const merged = PrefabManager.get("overridePrefab");
        assert.equal(merged!.getComponent(SerializableCounter)?.count, 99);
        assert.equal(
            merged!.components.filter(
                (component) => component instanceof SerializableCounter
            ).length,
            1
        );
    });

    it("should load a prefab from json", () => {
        const template = new Entity({ name: "jsonPrefab" });
        template.addComponent(new SerializableCounter(7));

        PrefabManager.load(IoUtils.export(template), [SerializableCounter]);

        const loaded = PrefabManager.get("jsonPrefab");

        assert.equal(loaded.name, "jsonPrefab");
        assert.equal(
            PrefabManager.get("jsonPrefab")!.getComponent(SerializableCounter)
                ?.count,
            7
        );
    });

    it("should append when loading a prefab with an existing name", () => {
        const base = new Entity({ name: "appendLoadPrefab" });
        base.addComponent(new SerializableCounter(3));
        PrefabManager.set("appendLoadPrefab", base);

        const template = new Entity({ name: "appendLoadPrefab" });
        template.addComponent(new NetworkCounter());
        PrefabManager.load(IoUtils.export(template), [NetworkCounter]);

        const merged = PrefabManager.get("appendLoadPrefab");
        assert.exists(merged!.getComponent(SerializableCounter));
        assert.exists(merged!.getComponent(NetworkCounter));
    });
});
