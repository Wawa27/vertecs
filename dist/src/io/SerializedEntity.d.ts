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
    protected $prefabName?: string;
    constructor(id: string, components: Map<string, SerializedNetworkComponent<any>>, name?: string, destroyed?: boolean, parent?: string, prefabName?: string);
    toJSON(): any;
    static reviver(key: string, value: any): any;
    get destroyed(): boolean | undefined;
    set destroyed(value: boolean | undefined);
    get parent(): string | undefined;
    set parent(value: string | undefined);
    get prefabName(): string | undefined;
    get id(): string;
    get name(): string | undefined;
    get components(): Map<string, SerializedComponent<any>>;
}
