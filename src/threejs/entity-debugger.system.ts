import { Material, Mesh, Object3D, Scene } from "three";
import { Entity } from "../core";
import KeyboardInputSystem from "../input/KeyboardInputSystem";
import EntityDebugger from "./EntityDebugger";
import ThreeObject3DComponent from "./three-object3D.component";

export default class EntityDebuggerSystem extends KeyboardInputSystem {
    #visible: boolean;

    #entities: Set<Entity>;

    #scene?: Scene;

    #wireframeMaterials: Map<Material, boolean>;

    public constructor(scene?: Scene, tps?: number) {
        super([EntityDebugger], "canvas", tps);
        this.#visible = false;
        this.#entities = new Set();
        this.#scene = scene;
        this.#wireframeMaterials = new Map();
    }

    public onEntityEligible(entity: Entity): void {
        this.#entities.add(entity);
    }

    public onEntityNoLongerEligible(entity: Entity): void {
        this.#entities.delete(entity);
    }

    public onKeyDown(key: string): void {
        if (key === "p") {
            this.#visible = !this.#visible;
            this.#toggleSceneWireframe();
        }
    }

    public onKeyRepeat(_key: string): void {}

    public onKeyUp(_key: string): void {}

    public onLoop(): void {
        super.onLoop();

        this.#entities.forEach((entity) => {
            const child = entity.findChildByName("entity-debugger");
            if (child) {
                const threeObject = child.getComponent(ThreeObject3DComponent);
                if (threeObject) {
                    threeObject.object3D.visible = this.#visible;
                }
            }
        });
    }

    #toggleSceneWireframe(): void {
        if (!this.#scene) {
            return;
        }

        this.#scene.traverse((object: Object3D) => {
            if (object instanceof Mesh) {
                const materials = Array.isArray(object.material)
                    ? object.material
                    : [object.material];

                materials.forEach((material) => {
                    if (this.#visible) {
                        this.#wireframeMaterials.set(
                            material,
                            material.wireframe
                        );
                        material.wireframe = true;
                    } else {
                        const original = this.#wireframeMaterials.get(material);
                        if (original !== undefined) {
                            material.wireframe = original;
                            this.#wireframeMaterials.delete(material);
                        }
                    }
                });
            }
        });
    }
}
