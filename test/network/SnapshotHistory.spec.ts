import { expect } from "chai";
import NetworkSnapshot from "../../src/network/NetworkSnapshot";
import SnapshotHistory from "../../src/network/snapshot-history";

describe("SnapshotHistory", () => {
    it("keeps snapshots in insertion order", () => {
        const history = new SnapshotHistory();
        const first = new NetworkSnapshot();
        const second = new NetworkSnapshot();

        history.add(first);
        history.add(second);

        expect(history.length).to.equal(2);
        expect(history.snapshots).to.deep.equal([first, second]);
    });

    it("removes the oldest snapshot when a 129th snapshot is added", () => {
        const history = new SnapshotHistory();
        const snapshots = Array.from(
            { length: SnapshotHistory.MAX_SNAPSHOTS + 1 },
            () => new NetworkSnapshot()
        );

        snapshots.forEach((snapshot) => history.add(snapshot));

        expect(history.length).to.equal(SnapshotHistory.MAX_SNAPSHOTS);
        expect(history.snapshots[0]).to.equal(snapshots[1]);
        expect(history.snapshots.at(-1)).to.equal(snapshots.at(-1));
    });
});
