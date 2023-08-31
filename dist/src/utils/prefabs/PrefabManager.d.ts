import Entity from "../../core/Entity";
export default class PrefabManager {
    #private;
    private constructor();
    static add(name: string, prefab: Entity): void;
    static get(name: string, id?: string): Entity | undefined;
}
