import type { Entity } from "../../core";
import Component from "../../core/Component";
import PrefabManager from "./PrefabManager";
import NetworkComponent from "../../network/network.component";

export default class IsPrefab extends NetworkComponent<string> {
    #prefabName: string;

    public constructor(prefabName = "") {
        super();
        this.#prefabName = prefabName;
    }

    public onAddedToEntity(entity: Entity): void {
        if (this.#prefabName && entity.ecsManager) {
            this.#instantiate();
        }
    }

    public accept(data: string): boolean {
        return false;
    }

    public isDirty(lastData: string): boolean {
        return false;
    }

    public read(prefabName: string): void {
        if (this.#prefabName === prefabName) {
            return;
        }
        this.#prefabName = prefabName;
        if (this.entity) {
            this.#instantiate();
        }
    }

    public write(): string {
        return this.#prefabName;
    }

    public clone(): Component {
        return new IsPrefab(this.#prefabName);
    }

    #instantiate(): void {
        const entity = this.entity!;

        let instance: Entity;
        try {
            instance = PrefabManager.get(this.#prefabName, entity.id);
        } catch {
            console.warn(`Cannot instantiate prefab "${this.#prefabName}"`);
            return;
        }

        if (entity.name === undefined) {
            entity.name = instance.name;
        }

        instance.components.forEach((component) => {
            if (!(component instanceof IsPrefab)) {
                entity.addComponent(component);
            }
        });

        instance.children.forEach((child) => entity.addChild(child));
    }

    public get prefabName(): string {
        return this.#prefabName;
    }

    public set prefabName(prefabName: string) {
        this.#prefabName = prefabName;
    }
}
