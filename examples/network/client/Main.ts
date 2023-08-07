import { EcsManager } from "../../../src";
import ExampleClientNetworkSystem from "./ExampleClientNetworkSystem";

const ecsManager = new EcsManager();

const start = async () => {
    await ecsManager.addSystem(
        new ExampleClientNetworkSystem("ws://localhost:10025")
    );

    await ecsManager.start();
};

start();
