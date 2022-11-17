import { SystemManager } from "../../../src";
import ExampleClientNetworkSystem from "./ExampleClientNetworkSystem";

const systemManager = SystemManager.getInstance();

systemManager.addSystem(new ExampleClientNetworkSystem("ws://localhost:10025"));

systemManager.start();
