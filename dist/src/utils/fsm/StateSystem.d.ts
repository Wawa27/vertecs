import { System } from "../../core";
import State from "./State";
export default abstract class StateSystem<T extends State> extends System<[T]> {
    protected constructor(StateClass: new (...args: any[]) => T, tps?: number, dependencies?: any[]);
}
