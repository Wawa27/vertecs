import { Camera, PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { Component, Entity, System } from "../core";
import ThreeComponent from "./ThreeComponent";

export default class ThreeSystem extends System {
    #scene: Scene;

    #camera: Camera;

    #renderer: WebGLRenderer;

    public constructor(tps?: number) {
        super([ThreeComponent], tps);
        this.#scene = new Scene();
        this.#camera = new PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );

        this.#renderer = new WebGLRenderer();
        this.#renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.#renderer.domElement);
    }

    public onEntityEligible(
        entity: Entity,
        lastComponentAdded: Component | undefined
    ) {
        const threeComponent = entity.getComponent(ThreeComponent);

        if (threeComponent) {
            this.#scene.add(threeComponent?.object3d);
        }
    }

    public async onStart(): Promise<void> {}

    protected onLoop(entities: Entity[], deltaTime: number): void {
        this.#renderer.render(this.#scene, this.#camera);
    }
}
