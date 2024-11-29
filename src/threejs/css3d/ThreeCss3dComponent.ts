// @ts-ignore
import { CSS3DObject } from "three/addons/renderers/CSS3DRenderer.js";
import { Component } from "../../core";

export default class ThreeCss3dComponent extends Component {
    #css3dObject: CSS3DObject;

    protected $props: Map<string, any>;

    public constructor(
        htmlElement: HTMLElement,
        id?: string,
        props?: Map<string, any>
    ) {
        super();
        this.$props = props ?? new Map();

        if (id) {
            htmlElement.setAttribute(
                "id",
                `${htmlElement.tagName.toLowerCase()}-${id}`
            );
        }
        this.#css3dObject = new CSS3DObject(htmlElement);
    }

    public get props() {
        return this.$props;
    }

    public get css3dObject(): CSS3DObject {
        return this.#css3dObject;
    }
}
