import { InstancedMesh, StaticDrawUsage } from "three";
import ThreeObject3D from "./ThreeObject3D";
import { Entity } from "../core";

export default class ThreeInstancedMesh extends ThreeObject3D {
    #entities: string[];

    public constructor(instancedMesh: InstancedMesh, id?: string) {
        super(instancedMesh, id);
        this.#entities = [];
        instancedMesh.instanceMatrix.setUsage(StaticDrawUsage);
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
        if (this.entities.length > 1024) {
            return new ThreeInstancedMesh(
                new InstancedMesh(
                    (super.object3D as InstancedMesh).geometry,
                    (super.object3D as InstancedMesh).material,
                    this.entities.length
                ),
                this.id
            );
        }
        return this;
    }
}
