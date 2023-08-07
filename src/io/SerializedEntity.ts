import type { SerializedNetworkComponent } from "../network/NetworkComponent";
import type SerializedComponent from "./SerializedComponent";

/**
 * The json representation of an entity
 */
export default class SerializedEntity {
    protected $id: string;

    protected $components: Map<string, SerializedComponent<any>>;

    protected $name?: string;

    protected $destroyed?: boolean;

    protected $parent?: string;

    public constructor(
        id: string,
        components: Map<string, SerializedNetworkComponent<any>>,
        name?: string,
        destroyed?: boolean,
        parent?: string
    ) {
        this.$id = id;
        this.$components = components;
        this.$name = name;
        this.$destroyed = destroyed;
        this.$parent = parent;
    }

    toJSON(): any {
        return {
            id: this.$id,
            name: this.$name,
            components: Array.from(this.$components.entries()),
            destroyed: this.$destroyed,
        };
    }

    static reviver(key: string, value: any): any {
        if (key === "components") {
            return new Map(value);
        }
        return value;
    }

    // TODO: Move to network entity
    public get destroyed(): boolean | undefined {
        return this.$destroyed;
    }

    public set destroyed(value: boolean | undefined) {
        this.$destroyed = value;
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
}
