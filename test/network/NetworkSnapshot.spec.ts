import { expect } from "chai";
import NetworkSnapshot from "../../src/network/NetworkSnapshot";

describe("NetworkSnapshot", () => {
    it("serializes its revision", () => {
        const snapshot = new NetworkSnapshot();
        snapshot.revision = 41;

        const serialized = JSON.parse(JSON.stringify(snapshot));

        expect(serialized.revision).to.equal(41);
    });
});
