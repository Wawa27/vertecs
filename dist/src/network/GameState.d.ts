import { SerializedEntity } from "../io";
import NetworkEntity from "./NetworkEntity";
export type CustomData = {
    [key: string]: any;
    scope: string;
};
export default class GameState {
    #private;
    constructor();
    clone(): GameState;
    toJSON(): {
        timestamp: number;
        entities: [string, SerializedEntity][];
        customData: any[];
    };
    static reviver(key: string, value: any): any;
    get timestamp(): number;
    set timestamp(value: number);
    get entities(): Map<string, NetworkEntity>;
    set entities(value: Map<string, NetworkEntity>);
    get customData(): CustomData[];
    set customData(value: CustomData[]);
}
