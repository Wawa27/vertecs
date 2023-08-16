import { EcsManager } from "../../../../src";
import ExampleClientNetworkSystem from "./ExampleClientNetworkSystem";

const ecsManager = new EcsManager();

Object.assign(global, { WebSocket: (await import("ws")).WebSocket });

const start = async () => {
    await ecsManager.addSystem(
        new ExampleClientNetworkSystem("ws://localhost:8080")
    );

    await ecsManager.start();
};

start();
