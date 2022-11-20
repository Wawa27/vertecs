import { EcsManager } from "../../../src";
import ExampleServerNetworkSystem from "./ExampleServerNetworkSystem";

const systemManager = EcsManager.getInstance();

systemManager.addSystem(new ExampleServerNetworkSystem());

systemManager.start();
