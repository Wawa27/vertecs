// @ts-ignore
import { CSS3DObject } from "three/addons/renderers/CSS3DRenderer.js";
import { Component } from "../../core";

export default class ThreeCss3dComponent extends Component {
    #css3dObject: CSS3DObject;

    public constructor(htmlElement: HTMLElement, id?: string) {
        super();

        if (id) {
            htmlElement.setAttribute(
                "id",
                `${htmlElement.tagName.toLowerCase()}-${id}`
            );
        }
        this.#css3dObject = new CSS3DObject(htmlElement);
    }

    public get css3dObject(): CSS3DObject {
        return this.#css3dObject;
    }
}
