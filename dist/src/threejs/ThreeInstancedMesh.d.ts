import { InstancedMesh } from "three";
import ThreeObject3D from "./ThreeObject3D";
import { Entity } from "../core";
export default class ThreeInstancedMesh extends ThreeObject3D {
    #private;
    constructor(instancedMesh: InstancedMesh, id?: string);
    onAddedToEntity(entity: Entity): void;
    onRemovedFromEntity(entity: Entity): void;
    getEntityIndex(entityId: string): number;
    get entities(): string[];
    clone(): ThreeInstancedMesh;
}
