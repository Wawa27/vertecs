import NetworkComponent from "./NetworkComponent";

type NetworkData = {
    ownerId: string;
    scope: NetworkScope;
};

type NetworkScope = "public" | "private";

export default class IsNetworked extends NetworkComponent<NetworkData> {
    #ownerId?: string;

    #scope?: NetworkScope;

    public constructor() {
        super();
    }

    public accept(data: NetworkData): boolean {
        return false;
    }

    public read(data: NetworkData) {
        this.#ownerId = data.ownerId;
        this.#scope = data.scope;
    }

    public write(): NetworkData {
        return {
            ownerId: this.#ownerId ?? "*",
            scope: this.#scope ?? "public",
        };
    }

    public shouldUpdate(): boolean {
        return false;
    }

    public get ownerId(): string {
        return this.#ownerId ?? "*";
    }

    public set ownerId(value: string) {
        this.#ownerId = value;
    }

    public get scope(): NetworkScope {
        return this.#scope ?? "public";
    }

    public set scope(value: NetworkScope) {
        this.#scope = value;
    }
}
