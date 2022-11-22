import { EcsManager } from "../../../src";
import ExampleClientNetworkSystem from "./ExampleClientNetworkSystem";

const ecsManager = new EcsManager();

const start = async () => {
    console.debug("Starting client...");
    await ecsManager.addSystem(
        new ExampleClientNetworkSystem("ws://localhost:10025")
    );

    await ecsManager.start();
    console.debug("Started !");
};

start();
