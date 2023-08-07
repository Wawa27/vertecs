// @ts-ignore
import { BodyOptions, Body } from "oimo";
import { Component } from "../core";

export type OimoComponentOptions = Exclude<BodyOptions, "rot" | "pos">;

export default class OimoComponent extends Component {
    readonly #bodyOptions: OimoComponentOptions;

    #body?: Body;

    public constructor(bodyOptions: OimoComponentOptions) {
        super();
        this.#bodyOptions = bodyOptions;
    }

    public get bodyOptions(): BodyOptions {
        return this.#bodyOptions;
    }

    public get body(): Body | undefined {
        return this.#body;
    }

    public set body(body: Body | undefined) {
        this.#body = body;
    }

    public clone(): Component {
        return new OimoComponent(this.#bodyOptions);
    }
}
