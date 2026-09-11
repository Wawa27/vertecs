import { Entity, System } from "../../core";
import ThreeShaderComponent from "./three-shader.component";
import { SystemConstructor } from "../../core/EcsManager";
import ThreeObject3DComponent from "../three-object3D.component";

export default class ThreeShaderSystem extends System<
    [ThreeObject3DComponent, ThreeShaderComponent]
> {
    public constructor(tps?: number, dependencies?: SystemConstructor<any>[]) {
        super([ThreeObject3DComponent, ThreeShaderComponent], tps, dependencies);
    }

    onEntityEligible(
        entity: Entity,
        components: [ThreeObject3DComponent, ThreeShaderComponent]
    ) {
        const [_, shader] = components;
        const mesh = entity.getComponent(ThreeObject3DComponent)?.object3D;
        if (mesh && "material" in mesh) {
            mesh.material = shader.material;
        }
    }

    protected onLoop(
        entities: [ThreeObject3DComponent, ThreeShaderComponent][],
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
