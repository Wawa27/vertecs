import { BoxGeometry, Mesh, MeshBasicMaterial } from "three";
import { Component, Entity } from "../core";
import { Transform } from "../math";
import ThreeObject3D from "./ThreeObject3D";

export default class EntityDebugger extends Component {
    public constructor() {
        super();
    }

    public onAddedToEntity(entity: Entity) {
        const debugEntity = new Entity({ name: "entity-debugger" });

        const transform = entity.getComponent(Transform);
        const scale = transform?.scaling ?? [1, 1, 1];

        const geometry = new BoxGeometry(scale[0], scale[1], scale[2]);
        const material = new MeshBasicMaterial({
            color: 0xff0000,
            wireframe: true,
        });

        debugEntity.addComponent(
            new ThreeObject3D(new Mesh(geometry, material))
        );
        debugEntity.addComponent(new Transform());

        entity.addChild(debugEntity);
    }

    public onRemovedFromEntity(entity: Entity) {
        entity.findChildByName("entity-debugger")?.destroy();
    }
}
