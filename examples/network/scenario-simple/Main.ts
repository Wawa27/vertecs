import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import type { ServerResponse } from "node:http";
import { EcsManager, Entity, IsNetworked } from "../../../src";
import CounterComponent from "./CounterComponent";
import CounterNetworkComponent from "./CounterNetworkComponent";
import ScenarioClientNetworkSystem from "./ScenarioClientNetworkSystem";
import ScenarioServerNetworkSystem from "./ScenarioServerNetworkSystem";

const PORT = 8094;
const HTTP_PORT = 8095;
const ADDRESS = `ws://localhost:${PORT}`;
const REFRESH_INTERVAL_MS = 100;

type ScenarioClient = {
    label: string;
    ecsManager: EcsManager;
    networkSystem: ScenarioClientNetworkSystem;
};

const serverEcsManager = new EcsManager();
const serverNetworkSystem = new ScenarioServerNetworkSystem(PORT);
const serverEntity = serverEcsManager.createEntity({
    name: "authoritative-counter",
});
const serverCounter = new CounterComponent();
serverEntity.addComponents(
    serverCounter,
    new CounterNetworkComponent(),
    new IsNetworked()
);

const clients: ScenarioClient[] = [];
const eventStreams = new Set<ServerResponse>();
let htmlPage = "";
let refreshTimer: NodeJS.Timeout | undefined;
let isStopping = false;
let lastRenderedText = "";

function findCounterValue(ecsManager: EcsManager): string {
    const entity = Entity.findByComponent(ecsManager, CounterComponent);
    return entity?.getComponent(CounterComponent)?.value.toString() ?? "-";
}

function getClientStatus(client: ScenarioClient): string {
    if (!client.networkSystem.connected) {
        return "disconnected";
    }
    return client.networkSystem.paused ? "paused" : "active";
}

function renderClient(client: ScenarioClient): string[] {
    return [
        `CLIENT ${client.label}`,
        `status:                 ${getClientStatus(client)}`,
        `value:                  ${findCounterValue(client.ecsManager)}`,
    ];
}

function renderText(): string {
    const lines = [
        "NETWORK SCENARIO: SIMPLE",
        "",
        "SERVER",
        `value:                  ${serverCounter.value}`,
        "",
        ...renderClient(clients[0]),
        "",
        ...renderClient(clients[1]),
        "",
        "[u] update server  [r] reset value",
        "[a] pause/resume A [b] pause/resume B",
    ];

    return lines.join("\n");
}

function render(): void {
    const text = renderText();
    if (text === lastRenderedText) {
        return;
    }
    lastRenderedText = text;
    const event = `data: ${JSON.stringify(text)}\n\n`;
    eventStreams.forEach((response) => response.write(event));
}

async function createClient(label: string): Promise<ScenarioClient> {
    const ecsManager = new EcsManager();
    const networkSystem = new ScenarioClientNetworkSystem(ADDRESS);
    await ecsManager.addSystem(networkSystem);
    await ecsManager.start();
    return { label, ecsManager, networkSystem };
}

function toggleClient(index: number): void {
    const client = clients[index];
    client.networkSystem.paused = !client.networkSystem.paused;
}

function runAction(action: string): boolean {
    switch (action) {
        case "u":
            serverCounter.value += 10;
            break;
        case "r":
            serverCounter.value = 0;
            break;
        case "a":
            toggleClient(0);
            break;
        case "b":
            toggleClient(1);
            break;
        default:
            return false;
    }
    render();
    return true;
}

const httpServer = createServer((request, response) => {
    const url = new URL(
        request.url ?? "/",
        `http://${request.headers.host ?? `localhost:${HTTP_PORT}`}`
    );

    if (request.method === "GET" && url.pathname === "/") {
        response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        response.end(htmlPage);
        return;
    }

    if (request.method === "GET" && url.pathname === "/events") {
        response.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
        });
        eventStreams.add(response);
        response.write(`data: ${JSON.stringify(renderText())}\n\n`);
        request.on("close", () => eventStreams.delete(response));
        return;
    }

    if (request.method === "POST" && url.pathname.startsWith("/action/")) {
        const action = url.pathname.slice("/action/".length);
        if (runAction(action)) {
            response.writeHead(204);
            response.end();
            return;
        }
    }

    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
});

async function stop(): Promise<void> {
    if (isStopping) {
        return;
    }
    isStopping = true;

    if (refreshTimer) {
        clearInterval(refreshTimer);
    }
    eventStreams.forEach((response) => response.end());
    eventStreams.clear();

    await Promise.all(clients.map((client) => client.ecsManager.stop()));
    await serverEcsManager.stop();
    if (httpServer.listening) {
        await new Promise<void>((resolve, reject) => {
            httpServer.close((error) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve();
            });
        });
    }
    process.stdout.write("\nScenario stopped.\n");
}

async function start(): Promise<void> {
    Object.assign(global, { WebSocket: (await import("ws")).WebSocket });

    await serverEcsManager.addSystem(serverNetworkSystem);
    await serverEcsManager.start();

    clients.push(await createClient("A"));
    clients.push(await createClient("B"));

    htmlPage = await readFile(new URL("./index.html", import.meta.url), "utf8");
    await new Promise<void>((resolve, reject) => {
        httpServer.once("error", reject);
        httpServer.listen(HTTP_PORT, () => {
            httpServer.off("error", reject);
            resolve();
        });
    });

    refreshTimer = setInterval(render, REFRESH_INTERVAL_MS);
    console.log(`Scenario page: http://localhost:${HTTP_PORT}`);
}

process.once("SIGINT", () => stop().catch(console.error));

start().catch((error) => {
    console.error(error);
    process.exitCode = 1;
    stop().catch(console.error);
});
