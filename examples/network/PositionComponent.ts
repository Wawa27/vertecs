import { Component } from "../../src";

export default class PositionComponent extends Component {
    #x: number;

    #y: number;

    public constructor(x: number, y: number) {
        super();

        this.#x = x;
        this.#y = y;
    }

    public get x(): number {
        return this.#x;
    }

    public set x(value: number) {
        this.#x = value;
    }

    public get y(): number {
        return this.#y;
    }

    public set y(value: number) {
        this.#y = value;
    }
}
