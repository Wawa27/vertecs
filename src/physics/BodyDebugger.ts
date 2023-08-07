import { BoxGeometry, Mesh, MeshBasicMaterial, SphereGeometry } from "three";
import { vec3 } from "gl-matrix";
import { Component, Entity } from "../core";
import { ThreeMesh } from "../threejs";
import { Transform } from "../math";
import SphereBody from "./bodies/SphereBody";

export default class BodyDebugger extends Component {
    public constructor() {
        super();
    }

    public onAddedToEntity(entity: Entity) {
        const sphereBody = entity.getComponent(SphereBody);
        const boundingBoxDebugEntity = entity.ecsManager?.createEntity({
            name: "bounding-box-debugger",
        });
        if (!boundingBoxDebugEntity) {
            return;
        }

        const boundingBox = sphereBody?.getBoundingBox();
        const boundingBoxSize = vec3.subtract(
            vec3.create(),
            boundingBox?.maximum || [0, 0, 0],
            boundingBox?.minimum || [0, 0, 0]
        );

        boundingBoxDebugEntity.addComponent(
            new ThreeMesh(
                new Mesh(
                    new BoxGeometry(
                        boundingBoxSize[0],
                        boundingBoxSize[1],
                        boundingBoxSize[2]
                    ),
                    new MeshBasicMaterial({ color: 0xff0000 })
                )
            )
        );

        const inverseScale = vec3.create();
        vec3.inverse(
            inverseScale,
            entity.getComponent(Transform)?.getWorldScale(vec3.create()) || [
                1, 1, 1,
            ]
        );

        boundingBoxDebugEntity.addComponent(
            new Transform(undefined, undefined, inverseScale)
        );

        entity.addChild(boundingBoxDebugEntity);
    }

    public onRemovedFromEntity(entity: Entity) {
        console.debug("destroying body debugger");
        console.debug(entity.findChildByName("body-debugger")?.name);
        entity.findChildByName("body-debugger")?.destroy();
        entity.findChildByName("bounding-box-debugger")?.destroy();
    }
}
