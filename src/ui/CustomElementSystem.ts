import { Entity, System } from "../core";
import IsCustomElement from "./IsCustomElement";

export default class CustomElementSystem extends System<[IsCustomElement]> {
    #root: HTMLElement;

    public constructor() {
        super([IsCustomElement]);
        this.#root =
            document.getElementById("gui") ?? document.createElement("div");
    }

    public onEntityEligible(entity: Entity, components: [IsCustomElement]) {
        const [guiElement] = components;

        this.#root.append(guiElement.htmlElement);
    }

    public onEntityNoLongerEligible(
        entity: Entity,
        components: [IsCustomElement]
    ) {
        const [guiElement] = components;

        guiElement.htmlElement.remove();
    }

    protected onLoop(
        components: [IsCustomElement][],
        entities: Entity[],
        deltaTime: number
    ) {
        components.forEach((component) => {
            const [guiElement] = component;

            if (guiElement.isDirty) {
                guiElement.isDirty = false;
            }
        });
    }
}
