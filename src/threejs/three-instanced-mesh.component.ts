import { InstancedMesh, StaticDrawUsage } from "three";
import ThreeObject3DComponent from "./three-object3D.component";
import { Transform } from "../math";

export default class ThreeInstancedMeshComponent extends ThreeObject3DComponent {
    readonly #instances: {
        transform: Transform;
        isDirty: boolean;
    }[];

    public constructor(instancedMesh: InstancedMesh, id?: string) {
        super(instancedMesh, id);
        this.#instances = [];
        for (let i = 0; i < instancedMesh.count; i++) {
            this.#instances.push({
                isDirty: false,
                transform: new Transform(),
            });
        }
        instancedMesh.instanceMatrix.setUsage(StaticDrawUsage);
    }

    public getInstance(index: number): {
        transform: Transform;
        isDirty: boolean;
    } {
        return this.#instances[index];
    }

    public markInstanceAsDirty(index: number): void {
        this.#instances[index].isDirty = true;
    }

    public unmarkInstanceAsDirty(index: number): void {
        this.#instances[index].isDirty = false;
    }

    public get instances(): { transform: Transform; isDirty: boolean }[] {
        return this.#instances;
    }

    public clone(): ThreeInstancedMeshComponent {
        return new ThreeInstancedMeshComponent(this.object3D as InstancedMesh);
    }
}
