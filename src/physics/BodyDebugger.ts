import { BoxGeometry, Mesh, MeshBasicMaterial, SphereGeometry } from "three";
import { vec3 } from "ts-gl-matrix";
import { Component, Entity } from "../core";
import { ThreeObject3D } from "../threejs";
import { Transform } from "../math";
import SphereBody from "./bodies/SphereBody";
import CubeBody from "./bodies/CubeBody";

export default class BodyDebugger extends Component {
    public constructor() {
        super();
    }

    public onAddedToEntity(entity: Entity) {
        const boundingBoxDebugEntity = entity.ecsManager!.createEntity({
            name: "bounding-box-debugger",
        });

        const sphereBody = entity.getComponent(SphereBody);
        if (sphereBody) {
            const sphereDebugger = this.getSphereDebugger(sphereBody);
            boundingBoxDebugEntity.addComponent(sphereDebugger);
        } else {
            const cubeBody = entity.getComponent(CubeBody);
            if (cubeBody) {
                boundingBoxDebugEntity.addComponent(
                    this.getCubeDebugger(cubeBody)
                );
            } else {
                console.warn("Debugger not found for : ", entity);
            }
        }

        const inverseScale = vec3.create();
        vec3.inverse(
            inverseScale,
            entity.getComponent(Transform)?.getWorldScale() || [1, 1, 1]
        );

        boundingBoxDebugEntity.addComponent(
            new Transform(undefined, undefined, inverseScale)
        );

        entity.addChild(boundingBoxDebugEntity);
    }

    getSphereDebugger(sphereBody: SphereBody) {
        return new ThreeObject3D(
            new Mesh(
                new SphereGeometry(sphereBody?.radius || 1, 32, 32),
                new MeshBasicMaterial({ color: 0xff0000 })
            )
        );
    }

    getCubeDebugger(cubeBody: CubeBody) {
        return new ThreeObject3D(
            new Mesh(
                new BoxGeometry(
                    cubeBody.width,
                    cubeBody.height,
                    cubeBody.depth
                ),
                new MeshBasicMaterial({ color: 0xff0000 })
            )
        );
    }

    public onRemovedFromEntity(entity: Entity) {
        entity.findChildByName("body-debugger")?.destroy();
        entity.findChildByName("bounding-box-debugger")?.destroy();
    }
}
