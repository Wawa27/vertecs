import { EcsManager } from "../../../src";
import ExampleClientNetworkSystem from "./ExampleClientNetworkSystem";

const ecsManager = new EcsManager();

await ecsManager.addSystem(
    new ExampleClientNetworkSystem("ws://localhost:10025")
);

await ecsManager.start();
