import { Entity, System } from "../../core";
import ThreeShaderComponent from "./three-shader.component";
import { SystemConstructor } from "../../core/EcsManager";
import ThreeObject3D from "../ThreeObject3D";

export default class ThreeShaderSystem extends System<
    [ThreeObject3D, ThreeShaderComponent]
> {
    public constructor(tps?: number, dependencies?: SystemConstructor<any>[]) {
        super([ThreeObject3D, ThreeShaderComponent], tps, dependencies);
    }

    onEntityEligible(
        entity: Entity,
        components: [ThreeObject3D, ThreeShaderComponent]
    ) {
        const [_, shader] = components;
        const mesh = entity.getComponent(ThreeObject3D)?.object3D;
        if (mesh && "material" in mesh) {
            mesh.material = shader.material;
        }
    }

    protected onLoop(
        entities: [ThreeObject3D, ThreeShaderComponent][],
        _entities: Entity[],
        deltaTime: number
    ): void {
        for (let i = 0; i < entities.length; i++) {
            const [object3d, shader] = entities[i];
            const mesh = object3d.object3D;
            shader.material.uniforms = shader.uniforms;
            shader.material.needsUpdate = true;
        }
    }
}
