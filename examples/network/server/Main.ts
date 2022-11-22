import { EcsManager } from "../../../src";
import ExampleServerNetworkSystem from "./ExampleServerNetworkSystem";

const systemManager = new EcsManager();

const start = async () => {
    console.log("Starting server...");
    await systemManager.addSystem(new ExampleServerNetworkSystem());

    await systemManager.start();
    console.log("Started !");
};

start();
