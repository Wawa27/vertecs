import { SerializedEntity } from "../io";
import NetworkEntity from "./NetworkEntity";

export type CustomData = {
    [key: string]: any;
    scope: string;
};

export default class GameState {
    #timestamp: number;

    #entities: Map<string, NetworkEntity>;

    #customData: CustomData[];

    public constructor() {
        this.#timestamp = Date.now();
        this.#entities = new Map();
        this.#customData = [];
    }

    public clone(): GameState {
        return Object.assign(Object.create(this), this);
    }

    public toJSON(): {
        timestamp: number;
        entities: [string, SerializedEntity][];
        customData: any[];
    } {
        return {
            timestamp: this.#timestamp,
            entities: Array.from(this.entities.entries()),
            customData: this.customData,
        };
    }

    public static reviver(key: string, value: any): any {
        if (key === "entities") {
            return new Map(
                value.map((entity: any) => [
                    entity[0],
                    new NetworkEntity(
                        entity[1].id,
                        new Map(entity[1].components),
                        entity[1].isDestroyed,
                        entity[1].tags,
                        entity[1].prefabName,
                        entity[1].name,
                        entity[1].parentId
                    ),
                ])
            );
        }
        return value;
    }

    public get timestamp(): number {
        return this.#timestamp;
    }

    public set timestamp(value: number) {
        this.#timestamp = value;
    }

    public get entities(): Map<string, NetworkEntity> {
        return this.#entities;
    }

    public set entities(value: Map<string, NetworkEntity>) {
        this.#entities = value;
    }

    public get customData(): CustomData[] {
        return this.#customData;
    }

    public set customData(value: CustomData[]) {
        this.#customData = value;
    }
}
