import { Box3, BoxGeometry, Mesh, MeshBasicMaterial, Vector3 } from "three";
import { vec3 } from "ts-gl-matrix";
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
        const threeObject = entity.getComponent(ThreeObject3D);

        let geometry: BoxGeometry;
        let position = vec3.fromValues(0, 0, 0);

        if (threeObject) {
            const box = new Box3().setFromObject(threeObject.object3D);
            const size = box.getSize(new Vector3());
            const center = box.getCenter(new Vector3());

            geometry = new BoxGeometry(size.x, size.y, size.z);
            position = vec3.fromValues(center.x, center.y, center.z);
        } else {
            const scale = transform?.scaling ?? [1, 1, 1];
            geometry = new BoxGeometry(scale[0], scale[1], scale[2]);
        }

        const material = new MeshBasicMaterial({
            color: 0xff0000,
            wireframe: true,
        });

        debugEntity.addComponent(
            new ThreeObject3D(new Mesh(geometry, material))
        );
        debugEntity.addComponent(new Transform(position));

        entity.addChild(debugEntity);
    }

    public onRemovedFromEntity(entity: Entity) {
        entity.findChildByName("entity-debugger")?.destroy();
    }
}
