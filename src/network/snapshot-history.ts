import NetworkSnapshot from "./NetworkSnapshot";

export default class SnapshotHistory {
    public static readonly MAX_SNAPSHOTS = 128;

    readonly #snapshots: NetworkSnapshot[] = [];

    public get snapshots(): readonly NetworkSnapshot[] {
        return this.#snapshots;
    }

    public get length(): number {
        return this.#snapshots.length;
    }

    public add(snapshot: NetworkSnapshot): void {
        this.#snapshots.push(snapshot);

        if (this.#snapshots.length > SnapshotHistory.MAX_SNAPSHOTS) {
            this.#snapshots.shift();
        }
    }
}
