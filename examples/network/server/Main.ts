import { EcsManager } from "../../../src";
import ExampleServerNetworkSystem from "./ExampleServerNetworkSystem";

const systemManager = new EcsManager();

await systemManager.addSystem(new ExampleServerNetworkSystem());

await systemManager.start();
