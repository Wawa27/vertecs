import { SerializedEntity } from "../io";
export default class GameState {
    #timestamp;
    #entities;
    #customData;
    constructor() {
        this.#timestamp = Date.now();
        this.#entities = new Map();
        this.#customData = [];
    }
    clone() {
        return Object.assign(Object.create(this), this);
    }
    toJSON() {
        return {
            timestamp: this.#timestamp,
            entities: Array.from(this.entities.entries()),
            customData: this.customData,
        };
    }
    static reviver(key, value) {
        if (key === "entities") {
            return new Map(value.map((entity) => [
                entity[0],
                new SerializedEntity(entity[1].id, new Map(entity[1].components), entity[1].name, entity[1].destroyed, entity[1].parent, entity[1].prefabName),
            ]));
        }
        return value;
    }
    get timestamp() {
        return this.#timestamp;
    }
    set timestamp(value) {
        this.#timestamp = value;
    }
    get entities() {
        return this.#entities;
    }
    set entities(value) {
        this.#entities = value;
    }
    get customData() {
        return this.#customData;
    }
    set customData(value) {
        this.#customData = value;
    }
}
