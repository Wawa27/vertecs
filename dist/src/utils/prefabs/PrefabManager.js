import IsPrefab from "./IsPrefab";
export default class PrefabManager {
    static #prefabs = new Map();
    constructor() { }
    static add(name, prefab) {
        if (!prefab.getComponent(IsPrefab)) {
            prefab.addComponent(new IsPrefab(name));
        }
        this.#prefabs.set(name, prefab);
    }
    static get(name, id) {
        return this.#prefabs.get(name)?.clone(id);
    }
}
