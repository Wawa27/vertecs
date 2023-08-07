import { DynamicDrawUsage, InstancedMesh } from "three";
import ThreeMesh from "./ThreeMesh";
import { Entity } from "../core";

export default class ThreeInstancedMesh extends ThreeMesh {
    #entities: string[];

    public constructor(instancedMesh: InstancedMesh, id?: string) {
        super(instancedMesh, id);
        this.#entities = [];
        instancedMesh.instanceMatrix.setUsage(DynamicDrawUsage);
    }

    public onAddedToEntity(entity: Entity) {
        this.#entities.push(entity.id);
    }

    public onRemovedFromEntity(entity: Entity) {
        const index = this.getEntityIndex(entity.id);
        if (index !== -1) {
            this.#entities.splice(index, 1);
        }
    }

    public getEntityIndex(entityId: string): number {
        return this.#entities.indexOf(entityId);
    }

    public get entities(): string[] {
        return this.#entities;
    }

    public clone(): ThreeInstancedMesh {
        if (this.entities.length > 1000) {
            console.debug("Cloning instanced mesh");
            return new ThreeInstancedMesh(
                super.object3d as InstancedMesh,
                this.id
            );
        }
        return this;
    }
}
