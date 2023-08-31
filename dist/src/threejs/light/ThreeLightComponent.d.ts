import { Light } from "three";
import { Component, Entity } from "../../core";
export default class ThreeLightComponent extends Component {
    #private;
    constructor(light: Light, target?: Entity, castShadow?: boolean);
    get target(): Entity | undefined;
    get light(): Light;
}
