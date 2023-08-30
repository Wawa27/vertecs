export default class Endpoint {
    #value;
    #isMinimum;
    #entity;
    constructor(value, isMinimum, entity) {
        this.#value = value;
        this.#isMinimum = isMinimum;
        this.#entity = entity;
    }
    get value() {
        return this.#value;
    }
    set value(value) {
        this.#value = value;
    }
    get isMinimum() {
        return this.#isMinimum;
    }
    set isMinimum(isMinimum) {
        this.#isMinimum = isMinimum;
    }
    get entity() {
        return this.#entity;
    }
    set entity(entity) {
        this.#entity = entity;
    }
}
