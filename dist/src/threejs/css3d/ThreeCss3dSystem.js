import { PerspectiveCamera, Scene } from "three";
// @ts-ignore
import { CSS3DRenderer } from "three/addons/renderers/CSS3DRenderer.js";
import { System } from "../../core";
import ThreeCss3dComponent from "./ThreeCss3dComponent";
import ThreeSystem from "../ThreeSystem";
import { Transform } from "../../math";
export default class ThreeCss3dSystem extends System {
    #renderer;
    #scene;
    #threeSystem;
    #camera;
    constructor(threeSystem, tps) {
        super([ThreeCss3dComponent, Transform], tps, [ThreeSystem]);
        this.#threeSystem = threeSystem;
        this.#camera = new PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 2000);
        this.#renderer = new CSS3DRenderer();
        this.#renderer.setSize(window.innerWidth, window.innerHeight);
        this.#scene = new Scene();
        // For some reason, the css renderer is 100x bigger than the webgl renderer so we need to scale it down
        this.#scene.scale.set(0.01, 0.01, 0.01);
        const container = document.getElementById("hud");
        if (!container) {
            throw new Error("No element with id 'app' found");
        }
        container.appendChild(this.#renderer.domElement);
    }
    onEntityEligible(entity, components) {
        const { css3dObject } = entity.getComponent(ThreeCss3dComponent);
        this.#scene.add(css3dObject);
    }
    onEntityNoLongerEligible(entity, components) {
        const [threeCss3dComponent] = components;
        this.#scene.remove(threeCss3dComponent.css3dObject);
    }
    onLoop(components, entities, deltaTime) {
        this.#camera.position.copy(this.#threeSystem.camera.position);
        this.#camera.quaternion.copy(this.#threeSystem.camera.quaternion);
        for (let i = 0; i < components.length; i++) {
            const [css3dComponent, transform] = components[i];
            const worldPosition = transform.getWorldPosition();
            // Position is multiplied by 100 because the css renderer is 100x bigger than the webgl renderer
            css3dComponent.css3dObject.position.x = worldPosition[0] * 100;
            css3dComponent.css3dObject.position.y = worldPosition[1] * 100;
            css3dComponent.css3dObject.position.z = worldPosition[2] * 100;
            css3dComponent.css3dObject.lookAt(this.#camera.position);
        }
        this.#renderer.render(this.#scene, this.#camera);
    }
}
