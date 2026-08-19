import { SerializedEntity } from "../io";
import NetworkEntity from "./NetworkEntity";
import type { SerializedCommand } from "./commands";

export default class GameState {
    #timestamp: number;

    #entities: Map<string, NetworkEntity>;

    #commands: SerializedCommand[];

    public constructor() {
        this.#timestamp = Date.now();
        this.#entities = new Map();
        this.#commands = [];
    }

    public clone(): GameState {
        return Object.assign(Object.create(this), this);
    }

    public toJSON(): {
        timestamp: number;
        entities: [string, SerializedEntity][];
        commands: SerializedCommand[];
    } {
        return {
            timestamp: this.#timestamp,
            entities: Array.from(this.entities.entries()),
            commands: this.commands,
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

    public get commands(): SerializedCommand[] {
        return this.#commands;
    }

    public set commands(value: SerializedCommand[]) {
        this.#commands = value;
    }
}
