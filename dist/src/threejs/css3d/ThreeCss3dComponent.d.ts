import { CSS3DObject } from "three/addons/renderers/CSS3DRenderer.js";
import { Component } from "../../core";
export default class ThreeCss3dComponent extends Component {
    #private;
    constructor(htmlElement: HTMLElement, id?: string);
    get css3dObject(): CSS3DObject;
}
