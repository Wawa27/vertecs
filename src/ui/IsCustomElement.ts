import Component from "../core/Component";
import { Entity } from "../core";

export default class IsCustomElement extends Component {
    #htmlElement: HTMLElement;

    #isDirty: boolean;

    public constructor(tagName: string, id?: string) {
        super();
        this.#htmlElement = document.createElement(tagName);
        this.#isDirty = true;
    }

    public onAddedToEntity(entity: Entity) {
        // @ts-ignore
        this.#htmlElement.entity = entity;
    }

    public get isDirty(): boolean {
        return this.#isDirty;
    }

    public set isDirty(value: boolean) {
        this.#isDirty = value;
    }

    public get htmlElement(): HTMLElement {
        return this.#htmlElement;
    }

    public set htmlElement(value: HTMLElement) {
        this.#htmlElement = value;
    }
}
