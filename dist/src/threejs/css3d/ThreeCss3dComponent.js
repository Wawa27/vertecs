// @ts-ignore
import { CSS3DObject } from "three/addons/renderers/CSS3DRenderer.js";
import { Component } from "../../core";
export default class ThreeCss3dComponent extends Component {
    #css3dObject;
    constructor(htmlElement, id) {
        super();
        if (id) {
            htmlElement.setAttribute("id", `${htmlElement.tagName.toLowerCase()}-${id}`);
        }
        this.#css3dObject = new CSS3DObject(htmlElement);
    }
    get css3dObject() {
        return this.#css3dObject;
    }
}
