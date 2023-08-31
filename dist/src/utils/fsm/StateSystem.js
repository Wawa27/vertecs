import { System } from "../../core";
export default class StateSystem extends System {
    constructor(StateClass, tps, dependencies) {
        super([StateClass], tps, dependencies);
    }
}
