import Entity from "../../core/Entity";
import IsPrefab from "./IsPrefab";

export default class PrefabManager {
    static #prefabs = new Map<string, Entity>();

    private constructor() {}

    static set(name: string, prefab: Entity) {
        if (!prefab.getComponent(IsPrefab)) {
            prefab.addComponent(new IsPrefab(name));
        }
        this.#prefabs.set(name, prefab);
    }

    static get(name: string, id?: string): Entity {
        const prefab = this.#prefabs.get(name);
        if (!prefab) {
            throw new Error(`Cannot find prefab with id "${name}"`);
        }
        return prefab?.clone(id);
    }
}
