import Entity from "../../core/Entity";
import IsPrefab from "./IsPrefab";

export default class PrefabManager {
    static #prefabs = new Map<string, Entity>();

    private constructor() {}

    static add(name: string, prefab: Entity) {
        if (!prefab.getComponent(IsPrefab)) {
            prefab.addComponent(new IsPrefab(name));
        }
        this.#prefabs.set(name, prefab);
    }

    static get(name: string, id?: string): Entity | undefined {
        return this.#prefabs.get(name)?.clone(id);
    }
}
