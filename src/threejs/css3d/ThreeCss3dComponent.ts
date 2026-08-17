import { CSS3DObject } from "three/addons/renderers/CSS3DRenderer.js";
import { Component } from "../../core";

export type BillboardMode = "full" | "screen";

export default class ThreeCss3dComponent extends Component {
    #css3dObject: CSS3DObject;

    protected $props: Map<string, any>;

    #billboardMode: BillboardMode;

    public constructor(
        htmlElement: HTMLElement,
        id?: string,
        props?: Map<string, any>,
        billboardMode: BillboardMode = "full"
    ) {
        super();
        this.$props = props ?? new Map();
        this.#billboardMode = billboardMode;

        if (id) {
            htmlElement.setAttribute(
                "id",
                `${htmlElement.tagName.toLowerCase()}-${id}`
            );
        }
        this.#css3dObject = new CSS3DObject(htmlElement);
    }

    public get billboardMode(): BillboardMode {
        return this.#billboardMode;
    }

    public get props() {
        return this.$props;
    }

    public get css3dObject(): CSS3DObject {
        return this.#css3dObject;
    }
}
