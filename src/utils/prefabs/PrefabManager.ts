import type { ComponentClass } from "../../core/Component";
import Entity from "../../core/Entity";
import IoUtils from "../../io/IoUtils";
import IsPrefab from "./IsPrefab";

export default class PrefabManager {
    static #prefabs = new Map<string, Entity>();

    private constructor() {}

    static set(name: string, prefab: Entity) {
        if (!prefab.getComponent(IsPrefab)) {
            prefab.addComponent(new IsPrefab(name));
        }
        const existing = this.#prefabs.get(name);
        if (existing) {
            this.#append(existing, prefab);
            return;
        }
        this.#prefabs.set(name, prefab);
    }

    static load(json: string, componentClasses: ComponentClass[]): void {
        const prefab = IoUtils.import(componentClasses, json);
        if (!prefab.name) {
            throw new Error("Cannot load a prefab without a name");
        }
        this.set(prefab.name, prefab);
    }

    static async loadFile(
        prefabs: string[],
        componentClasses: ComponentClass[]
    ): Promise<void> {
        prefabs.forEach((prefabJson) => {
            this.load(JSON.stringify(prefabJson), componentClasses);
        });
    }

    static get(name: string, id?: string): Entity {
        const prefab = this.#prefabs.get(name);
        if (!prefab) {
            throw new Error(`Cannot find prefab with id "${name}"`);
        }
        return prefab?.clone(id);
    }

    static #append(target: Entity, source: Entity): void {
        source.components.forEach((component) => {
            const componentClass = component.constructor as ComponentClass;
            if (target.hasComponent(componentClass)) {
                target.removeComponent(componentClass);
            }
            target.addComponent(component);
        });

        source.children.forEach((child) => {
            const targetChild = target.children.find(
                (targetChild) => targetChild.name === child.name
            );
            if (!targetChild) {
                target.addChild(child);
            }
        });
    }
}
