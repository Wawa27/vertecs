import { assert } from "chai";
import { BoxGeometry, Mesh, MeshBasicMaterial, Scene } from "three";
import { Entity } from "../../src/core";
import { Transform } from "../../src/math";
import EntityDebugger from "../../src/threejs/EntityDebugger";
import EntityDebuggerSystem from "../../src/threejs/entity-debugger.system";
import ThreeObject3DComponent from "../../src/threejs/three-object3D.component";

describe("EntityDebuggerSystem", () => {
    it("shows entity hitboxes without changing scene materials", () => {
        const scene = new Scene();
        const material = new MeshBasicMaterial();
        scene.add(new Mesh(new BoxGeometry(), material));
        const entity = new Entity({ components: [new Transform()] });
        entity.addComponent(new EntityDebugger());
        const system = new EntityDebuggerSystem(scene);
        system.onEntityEligible(entity);

        system.onKeyDown("p");
        system.onLoop();

        const debugMesh = entity
            .findChildByName("entity-debugger")
            ?.getComponent(ThreeObject3DComponent)?.object3D;
        assert.isTrue(debugMesh?.visible);
        assert.isFalse(material.wireframe);
    });
});
