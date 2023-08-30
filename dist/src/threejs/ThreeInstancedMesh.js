import { InstancedMesh, StaticDrawUsage } from "three";
import ThreeObject3D from "./ThreeObject3D";
export default class ThreeInstancedMesh extends ThreeObject3D {
    #entities;
    constructor(instancedMesh, id) {
        super(instancedMesh, id);
        this.#entities = [];
        instancedMesh.instanceMatrix.setUsage(StaticDrawUsage);
    }
    onAddedToEntity(entity) {
        this.#entities.push(entity.id);
    }
    onRemovedFromEntity(entity) {
        const index = this.getEntityIndex(entity.id);
        if (index !== -1) {
            this.#entities.splice(index, 1);
        }
    }
    getEntityIndex(entityId) {
        return this.#entities.indexOf(entityId);
    }
    get entities() {
        return this.#entities;
    }
    clone() {
        if (this.entities.length > 1024) {
            return new ThreeInstancedMesh(new InstancedMesh(super.object3D.geometry, super.object3D.material, this.entities.length), this.id);
        }
        return this;
    }
}
