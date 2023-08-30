import { BodyOptions, Body } from "oimo";
import { Component } from "../core";
export type OimoComponentOptions = Exclude<BodyOptions, "rot" | "pos">;
export default class OimoComponent extends Component {
    #private;
    constructor(bodyOptions: OimoComponentOptions);
    get bodyOptions(): BodyOptions;
    get body(): Body | undefined;
    set body(body: Body | undefined);
    clone(): Component;
}
