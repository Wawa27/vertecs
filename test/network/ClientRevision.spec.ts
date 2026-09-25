import { expect } from "chai";
import {
    ClientNetworkSystem,
    EcsManager,
    Entity,
    IsNetworked,
    NetworkTransform,
    SetupCommand,
    Transform,
} from "../../src";
import NetworkSnapshot from "../../src/network/NetworkSnapshot";
import SerializedNetworkEntity from "../../src/network/SerializedNetworkEntity";

class FakeBrowserWebSocket {
    public static instance?: FakeBrowserWebSocket;

    readonly sent: string[] = [];

    readonly #listeners = new Map<string, ((event?: any) => void)[]>();

    public constructor(_address: string) {
        FakeBrowserWebSocket.instance = this;
    }

    public addEventListener(
        event: string,
        listener: (event?: any) => void
    ): void {
        const listeners = this.#listeners.get(event) ?? [];
        listeners.push(listener);
        this.#listeners.set(event, listeners);
    }

    public send(data: string): void {
        this.sent.push(data);
    }

    public open(): void {
        this.#emit("open");
    }

    public receive(snapshot: NetworkSnapshot): void {
        this.#emit("message", { data: JSON.stringify(snapshot) });
    }

    public close(): void {
        this.#emit("close");
    }

    #emit(event: string, data?: any): void {
        this.#listeners.get(event)?.forEach((listener) => listener(data));
    }
}

class RevisionClientNetworkSystem extends ClientNetworkSystem {
    public constructor() {
        super([NetworkTransform], "ws://test");
    }

    protected onConnect(): void {}

    protected onDisconnect(): void {}

    protected onNewEntity(): void {}

    protected onDeletedEntity(): void {}
}

describe("client snapshot revisions", () => {
    it("increments payload revisions and replays movement newer than the server acknowledgement", async () => {
        const originalWebSocket = globalThis.WebSocket;
        Object.assign(globalThis, { WebSocket: FakeBrowserWebSocket });

        try {
            const system = new RevisionClientNetworkSystem();
            const manager = new EcsManager();
            await manager.addSystem(system);
            const webSocket = FakeBrowserWebSocket.instance!;
            webSocket.open();

            const entity = new Entity({ id: "player" });
            const isNetworked = new IsNetworked("client");
            const networkTransform = new NetworkTransform();
            entity.addComponent(isNetworked);
            entity.addComponent(networkTransform);
            manager.addEntity(entity);

            const setup = new NetworkSnapshot();
            setup.revision = 1;
            setup.commands.push(new SetupCommand("client").serialize());
            webSocket.receive(setup);
            system.loop([[isNetworked]], [entity]);
            webSocket.sent.length = 0;

            networkTransform.deserialize({
                className: "NetworkTransform",
                data: {
                    position: [0, 0, 0],
                    rotation: [0, 0, 0, 1],
                    scale: [1, 1, 1],
                },
                updateTimestamp: -1,
                ownerId: "client",
            });

            const transform = entity.getComponent(Transform)!;
            transform.setWorldPosition([1, 0, 0]);
            system.loop([[isNetworked]], [entity]);
            expect(JSON.parse(webSocket.sent.at(-1)!).revision).to.equal(1);

            transform.setWorldPosition([2, 0, 0]);
            system.loop([[isNetworked]], [entity]);
            expect(JSON.parse(webSocket.sent.at(-1)!).revision).to.equal(2);

            // This movement is below the network dirty threshold and has not
            // been included in a client snapshot yet.
            transform.setWorldPosition([2.05, 0, 0]);

            const authoritative = new NetworkSnapshot();
            authoritative.revision = 2;
            authoritative.ackRevision = 1;
            authoritative.entities.set(
                entity.id,
                new SerializedNetworkEntity(
                    entity.id,
                    new Map([
                        [
                            "NetworkTransform",
                            {
                                className: "NetworkTransform",
                                data: {
                                    position: [0.5, 0, 0],
                                    rotation: [0, 0, 0, 1],
                                    scale: [1, 1, 1],
                                },
                                updateTimestamp: 999,
                            },
                        ],
                    ]),
                    false,
                    []
                )
            );

            webSocket.receive(authoritative);
            system.loop([[isNetworked]], [entity]);

            expect(transform.getWorldPosition()[0]).to.be.closeTo(
                1.55,
                0.00001
            );
            expect(JSON.parse(webSocket.sent.at(-1)!).revision).to.equal(0);
        } finally {
            Object.assign(globalThis, { WebSocket: originalWebSocket });
            FakeBrowserWebSocket.instance = undefined;
        }
    });
});
