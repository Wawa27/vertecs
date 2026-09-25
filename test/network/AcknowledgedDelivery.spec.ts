import { expect } from "chai";
import type { WebSocket } from "ws";
import { Component, EcsManager } from "../../src/core";
import SerializedNetworkEntity from "../../src/network/SerializedNetworkEntity";
import NetworkSnapshot from "../../src/network/NetworkSnapshot";
import NetworkComponent from "../../src/network/network.component";
import ClientHandler from "../../src/network/server/ClientHandler";
import ServerNetworkSystem from "../../src/network/server/ServerNetworkSystem";

class FakeWebSocket {
    readonly sent: string[] = [];

    readonly #listeners = new Map<string, ((data: string) => void)[]>();

    public on(event: string, listener: (data: string) => void): this {
        const listeners = this.#listeners.get(event) ?? [];
        listeners.push(listener);
        this.#listeners.set(event, listeners);
        return this;
    }

    public send(data: string): void {
        this.sent.push(data);
    }

    public receive(snapshot: NetworkSnapshot): void {
        this.#listeners
            .get("message")
            ?.forEach((listener) => listener(JSON.stringify(snapshot)));
    }

    public clear(): void {
        this.sent.length = 0;
    }
}

class RevisionNetworkComponent extends NetworkComponent<{ value: number }> {
    public value = 0;

    public constructor() {
        super();
    }

    public accept(): boolean {
        return true;
    }

    public read(data: { value: number }): void {
        this.value = data.value;
    }

    public write(): { value: number } {
        return { value: this.value };
    }

    public isDirty(lastData: { value: number }): boolean {
        return this.value !== lastData.value;
    }

    public clone(): Component {
        return new RevisionNetworkComponent();
    }
}

function createHandler(): {
    handler: ClientHandler;
    webSocket: FakeWebSocket;
} {
    const webSocket = new FakeWebSocket();
    const server = new ServerNetworkSystem([], ClientHandler);
    const handler = new ClientHandler(
        new EcsManager(),
        webSocket as unknown as WebSocket,
        server
    );
    return { handler, webSocket };
}

function createEntity(value: number): SerializedNetworkEntity {
    return new SerializedNetworkEntity(
        "entity",
        new Map([
            [
                "TestComponent",
                {
                    className: "TestComponent",
                    data: { value },
                    updateTimestamp: value,
                },
            ],
        ]),
        false,
        []
    );
}

function acknowledge(
    handler: ClientHandler,
    webSocket: FakeWebSocket,
    revision: number
): void {
    const acknowledgement = new NetworkSnapshot();
    acknowledgement.ackRevision = revision;
    webSocket.receive(acknowledgement);
    handler.processClientSnapshot();
}

describe("acknowledged server delivery", () => {
    it("acknowledges each processed client revision and ignores duplicates", () => {
        const webSocket = new FakeWebSocket();
        const server = new ServerNetworkSystem(
            [RevisionNetworkComponent],
            ClientHandler
        );
        const handler = new ClientHandler(
            new EcsManager(),
            webSocket as unknown as WebSocket,
            server
        );
        const component = new RevisionNetworkComponent();
        handler.clientEntity.addComponent(component);

        const clientSnapshot = new NetworkSnapshot();
        clientSnapshot.revision = 1;
        clientSnapshot.entities.set(
            handler.clientEntity.id,
            new SerializedNetworkEntity(
                handler.clientEntity.id,
                new Map([
                    [
                        RevisionNetworkComponent.name,
                        {
                            className: RevisionNetworkComponent.name,
                            data: { value: 1 },
                            updateTimestamp: -1,
                        },
                    ],
                ]),
                false,
                []
            )
        );

        webSocket.receive(clientSnapshot);
        handler.processClientSnapshot();
        handler.updateClient();

        expect(component.value).to.equal(1);
        expect(handler.lastProcessedClientRevision).to.equal(1);
        expect(JSON.parse(webSocket.sent.at(-1)!).ackRevision).to.equal(1);

        clientSnapshot.entities
            .get(handler.clientEntity.id)!
            .components.get(RevisionNetworkComponent.name)!.data.value = 2;
        webSocket.receive(clientSnapshot);
        handler.processClientSnapshot();

        expect(component.value).to.equal(1);
        expect(handler.lastProcessedClientRevision).to.equal(1);
    });

    it("timestamps a revision when it is finalized", () => {
        const originalNow = Date.now;
        let now = 100;
        Date.now = () => now;

        try {
            const { handler, webSocket } = createHandler();
            handler.sendEntity(createEntity(20));

            now = 200;
            handler.updateClient();

            expect(JSON.parse(webSocket.sent[0]).timestamp).to.equal(200);
        } finally {
            Date.now = originalNow;
        }
    });

    it("retains an update independently for each client until it is acknowledged", () => {
        const clientA = createHandler();
        const clientB = createHandler();
        const entity = createEntity(20);

        clientA.handler.sendEntity(entity);
        clientB.handler.sendEntity(entity);
        clientA.handler.updateClient();
        clientB.handler.updateClient();

        expect(clientA.webSocket.sent).to.have.length(1);
        expect(clientB.webSocket.sent).to.have.length(1);
        expect(JSON.parse(clientA.webSocket.sent[0]).revision).to.equal(1);
        expect(JSON.parse(clientB.webSocket.sent[0]).revision).to.equal(1);

        acknowledge(clientA.handler, clientA.webSocket, 1);
        clientA.webSocket.clear();
        clientB.webSocket.clear();

        clientA.handler.updateClient();
        clientB.handler.updateClient();

        expect(clientA.webSocket.sent).to.have.length(0);
        expect(clientB.webSocket.sent).to.have.length(1);
        expect(JSON.parse(clientB.webSocket.sent[0]).revision).to.equal(1);
    });

    it("does not let an old acknowledgement discard a newer update", () => {
        const { handler, webSocket } = createHandler();

        handler.sendEntity(createEntity(20));
        handler.updateClient();
        handler.sendEntity(createEntity(21));
        handler.updateClient();

        acknowledge(handler, webSocket, 1);
        webSocket.clear();
        handler.updateClient();

        expect(webSocket.sent).to.have.length(1);
        const remainingSnapshot = JSON.parse(webSocket.sent[0]);
        expect(remainingSnapshot.revision).to.equal(2);
        expect(
            remainingSnapshot.entities[0][1].components[0][1].data.value
        ).to.equal(21);

        acknowledge(handler, webSocket, 2);
        webSocket.clear();
        handler.updateClient();

        expect(webSocket.sent).to.have.length(0);
    });
});
