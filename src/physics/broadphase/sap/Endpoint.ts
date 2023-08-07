import { Entity } from "../../../core";

export default class Endpoint {
    #value: number;

    #isMinimum: boolean;

    #entity: Entity;

    public constructor(value: number, isMinimum: boolean, entity: Entity) {
        this.#value = value;
        this.#isMinimum = isMinimum;
        this.#entity = entity;
    }

    public get value(): number {
        return this.#value;
    }

    public set value(value: number) {
        this.#value = value;
    }

    public get isMinimum(): boolean {
        return this.#isMinimum;
    }

    public set isMinimum(isMinimum: boolean) {
        this.#isMinimum = isMinimum;
    }

    public get entity(): Entity {
        return this.#entity;
    }

    public set entity(entity: Entity) {
        this.#entity = entity;
    }
}
