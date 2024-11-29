import type { SerializedNetworkComponent } from "../network/NetworkComponent";
import type SerializedComponent from "./SerializedComponent";

/**
 * The json representation of an entity
 */
export default class SerializedEntity {
    protected $id: string;

    protected $components: Map<string, SerializedComponent<any>>;

    protected $name?: string;

    protected $parentId?: string;

    protected $prefabName?: string;

    protected $tags: string[];

    public constructor(
        id: string,
        components: Map<string, SerializedNetworkComponent<any>>,
        name?: string,
        parentId?: string,
        prefabName?: string,
        tags?: string[]
    ) {
        this.$id = id;
        this.$components = components;
        this.$name = name;
        this.$parentId = parentId;
        this.$prefabName = prefabName;
        this.$tags = tags ?? [];
    }

    toJSON(): any {
        return {
            id: this.$id,
            name: this.$name,
            components: Array.from(this.$components.entries()),
            parentId: this.$parentId,
            prefabName: this.$prefabName,
            tags: this.$tags,
        };
    }

    static reviver(key: string, value: any): any {
        if (key === "components") {
            return new Map(value);
        }
        return value;
    }

    public get parentId(): string | undefined {
        return this.$parentId;
    }

    public set parentId(value: string | undefined) {
        this.$parentId = value;
    }

    public get prefabName(): string | undefined {
        return this.$prefabName;
    }

    public get id(): string {
        return this.$id;
    }

    public get name(): string | undefined {
        return this.$name;
    }

    public get components(): Map<string, SerializedComponent<any>> {
        return this.$components;
    }

    public get tags(): string[] {
        return this.$tags;
    }
}
