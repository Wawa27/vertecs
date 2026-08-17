import { PerspectiveCamera, Scene, Vector3 } from "three";
import { CSS3DRenderer } from "three/addons/renderers/CSS3DRenderer.js";
import { Entity, System } from "../../core";
import ThreeCss3dComponent from "./ThreeCss3dComponent";
import ThreeSystem from "../ThreeSystem";
import { Transform } from "../../math";

export default class ThreeCss3dSystem extends System<
    [ThreeCss3dComponent, Transform]
> {
    #renderer: CSS3DRenderer;

    #scene: Scene;

    #threeSystem: ThreeSystem;

    #camera: PerspectiveCamera;

    #screenLayer?: HTMLDivElement;

    public constructor(threeSystem: ThreeSystem, tps?: number) {
        super([ThreeCss3dComponent, Transform], tps, [ThreeSystem]);

        this.#threeSystem = threeSystem;

        this.#camera = new PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );

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

        this.#screenLayer = document.createElement("div");
        this.#screenLayer.style.position = "absolute";
        this.#screenLayer.style.top = "0";
        this.#screenLayer.style.left = "0";
        this.#screenLayer.style.width = "100%";
        this.#screenLayer.style.height = "100%";
        this.#screenLayer.style.pointerEvents = "none";
        container.appendChild(this.#screenLayer);
    }

    public onEntityEligible(
        entity: Entity,
        components: [ThreeCss3dComponent, Transform]
    ) {
        const css3dComponent = entity.getComponent(ThreeCss3dComponent)!;
        if (css3dComponent.billboardMode === "screen" && this.#screenLayer) {
            const { element } = css3dComponent.css3dObject;
            element.style.position = "absolute";
            element.style.top = "0";
            element.style.left = "0";
            this.#screenLayer.appendChild(element);
        } else {
            this.#scene.add(css3dComponent.css3dObject);
        }
    }

    public onEntityNoLongerEligible(
        entity: Entity,
        components: [ThreeCss3dComponent, Transform]
    ) {
        const css3dComponent = entity.getComponent(ThreeCss3dComponent)!;
        if (css3dComponent.billboardMode === "screen" && this.#screenLayer) {
            const { element } = css3dComponent.css3dObject;
            if (element.parentElement === this.#screenLayer) {
                this.#screenLayer.removeChild(element);
            }
        } else {
            this.#scene.remove(css3dComponent.css3dObject);
        }
    }

    protected onLoop(
        components: [ThreeCss3dComponent, Transform][],
        entities: Entity[],
        deltaTime: number
    ): void {
        this.#camera.position.copy(this.#threeSystem.getCamera().position);
        this.#camera.quaternion.copy(this.#threeSystem.getCamera().quaternion);

        for (let i = 0; i < components.length; i++) {
            const [css3dComponent, transform] = components[i];

            css3dComponent.props.forEach((value, key) => {
                css3dComponent.css3dObject.element.setAttribute(key, value);
            });

            if (css3dComponent.billboardMode === "screen") {
                this.#updateScreenSpace(css3dComponent, transform);
            } else {
                this.#updateWorldSpace(css3dComponent, transform);
            }
        }
        this.#renderer.render(this.#scene, this.#camera);
    }

    #updateWorldSpace(
        css3dComponent: ThreeCss3dComponent,
        transform: Transform
    ) {
        const worldPosition = transform.getWorldPosition();

        css3dComponent.css3dObject.position.x = worldPosition[0] * 100;
        css3dComponent.css3dObject.position.y = worldPosition[1] * 100;
        css3dComponent.css3dObject.position.z = worldPosition[2] * 100;
        css3dComponent.css3dObject.scale.set(100, 100, 1);

        css3dComponent.css3dObject.lookAt(this.#camera.position);
    }

    #updateScreenSpace(
        css3dComponent: ThreeCss3dComponent,
        transform: Transform
    ): void {
        const { element } = css3dComponent.css3dObject;
        const worldPosition = transform.getWorldPosition();
        const projected = new Vector3(
            worldPosition[0],
            worldPosition[1],
            worldPosition[2]
        ).project(this.#threeSystem.getCamera());

        if (projected.z > 1) {
            element.style.display = "none";
            return;
        }

        element.style.display = "";

        const sx = (projected.x * 0.5 + 0.5) * window.innerWidth;
        const sy = (-projected.y * 0.5 + 0.5) * window.innerHeight;

        element.style.transform = `translate(${sx}px, ${sy}px) translate(-50%, -50%)`;
    }
}
