import { EcsManager } from "../../../src";
import ExampleClientNetworkSystem from "./ExampleClientNetworkSystem";

const systemManager = EcsManager.getInstance();

systemManager.addSystem(new ExampleClientNetworkSystem("ws://localhost:10025"));

systemManager.start();
