import { EcsManager } from "../../../src";
import ExampleServerNetworkSystem from "./ExampleServerNetworkSystem";

const ecsManager = new EcsManager();

const start = async () => {
    console.log("Starting server...");
    await ecsManager.addSystem(new ExampleServerNetworkSystem());

    await ecsManager.start();
    console.log("Started !");
};

start();
