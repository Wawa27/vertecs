import { SystemManager } from "../../../src";
import ExampleServerNetworkSystem from "./ExampleServerNetworkSystem";

const systemManager = SystemManager.getInstance();

systemManager.addSystem(new ExampleServerNetworkSystem());

systemManager.start();
