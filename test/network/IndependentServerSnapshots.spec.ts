import { assert } from "chai";
import {
    Entity,
    NetworkTransform,
    ServerNetworkSystem,
    Transform,
} from "../../src";
import SerializableCounter from "../components/SerializableCounter";
import TestClientHandler from "./systems/TestClientHandler";

class TestServerNetworkSystem extends ServerNetworkSystem {
    public constructor() {
        super([NetworkTransform], TestClientHandler);
    }

    public snapshot(entity: Entity) {
        return this.serializeEntity(entity);
    }
}

class MixedComponentServerNetworkSystem extends ServerNetworkSystem {
    public constructor() {
        super([NetworkTransform, SerializableCounter], TestClientHandler);
    }

    public snapshot(entity: Entity) {
        return this.serializeEntity(entity);
    }
}

describe("independent server snapshots", () => {
    it("tracks dirty updates independently per server", () => {
        const entity = new Entity();
        const networkTransform = new NetworkTransform();
        entity.addComponent(networkTransform);

        const transform = entity.getComponent(Transform)!;
        const gameServer = new TestServerNetworkSystem();
        const editorServer = new TestServerNetworkSystem();

        assert.exists(gameServer.snapshot(entity));
        assert.exists(editorServer.snapshot(entity));
        assert.isUndefined(gameServer.snapshot(entity));
        assert.isUndefined(editorServer.snapshot(entity));

        transform.setWorldPosition([10, 0, 0]);

        const gameMovement = gameServer.snapshot(entity);
        const editorMovement = editorServer.snapshot(entity);

        assert.deepEqual(
            gameMovement?.components.get("NetworkTransform")?.data.position,
            [10, 0, 0]
        );
        assert.deepEqual(
            editorMovement?.components.get("NetworkTransform")?.data.position,
            [10, 0, 0]
        );
        assert.isUndefined(gameServer.snapshot(entity));
        assert.isUndefined(editorServer.snapshot(entity));
    });

    it("tracks metadata independently per server", () => {
        const entity = new Entity();
        const networkTransform = new NetworkTransform();
        entity.addComponent(networkTransform);

        const gameServer = new TestServerNetworkSystem();
        const editorServer = new TestServerNetworkSystem();

        gameServer.snapshot(entity);
        editorServer.snapshot(entity);
        networkTransform.ownerId = "player-1";

        const gameSnapshot = gameServer.snapshot(entity);
        const editorSnapshot = editorServer.snapshot(entity);

        assert.equal(
            gameSnapshot?.components.get("NetworkTransform")?.ownerId,
            "player-1"
        );
        assert.equal(
            editorSnapshot?.components.get("NetworkTransform")?.ownerId,
            "player-1"
        );
    });

    it("ignores serializable components without a network contract", () => {
        const entity = new Entity();
        entity.addComponent(new NetworkTransform());
        entity.addComponent(new SerializableCounter());

        const server = new MixedComponentServerNetworkSystem();
        const initialSnapshot = server.snapshot(entity);

        assert.exists(initialSnapshot?.components.get("NetworkTransform"));
        assert.notExists(
            initialSnapshot?.components.get("SerializableCounter")
        );
        assert.doesNotThrow(() => server.snapshot(entity));
    });
});
