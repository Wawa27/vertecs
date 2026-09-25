import SerializedNetworkEntity from "./SerializedNetworkEntity";
import type { SerializedCommand } from "./commands";

export default class NetworkSnapshot {
    #revision: number;

    #ackRevision: number;

    #timestamp: number;

    #entities: Map<string, SerializedNetworkEntity>;

    #commands: SerializedCommand[];

    public constructor() {
        this.#revision = 0;
        this.#ackRevision = 0;
        this.#timestamp = Date.now();
        this.#entities = new Map();
        this.#commands = [];
    }

    public clone(): NetworkSnapshot {
        return Object.assign(Object.create(this), this);
    }

    public toJSON(): {
        revision: number;
        ackRevision: number;
        timestamp: number;
        entities: [string, SerializedNetworkEntity][];
        commands: SerializedCommand[];
    } {
        return {
            revision: this.#revision,
            ackRevision: this.#ackRevision,
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
                    new SerializedNetworkEntity(
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

    public get revision(): number {
        return this.#revision;
    }

    public set revision(value: number) {
        this.#revision = value;
    }

    public get ackRevision(): number {
        return this.#ackRevision;
    }

    public set ackRevision(value: number) {
        this.#ackRevision = value;
    }

    public get timestamp(): number {
        return this.#timestamp;
    }

    public set timestamp(value: number) {
        this.#timestamp = value;
    }

    public get entities(): Map<string, SerializedNetworkEntity> {
        return this.#entities;
    }

    public set entities(value: Map<string, SerializedNetworkEntity>) {
        this.#entities = value;
    }

    public get commands(): SerializedCommand[] {
        return this.#commands;
    }

    public set commands(value: SerializedCommand[]) {
        this.#commands = value;
    }
}
