import { OrthographicCamera } from "three";
import { EcsManager, ThreeCamera, ThreeSystem, Transform, } from "../../../../src";
import PongClientNetworkSystem from "./PongClientNetworkSystem";
const ecsManager = new EcsManager();
const camera = ecsManager.createEntity();
camera.addComponents(new Transform([0, 0, 1]), new ThreeCamera(new OrthographicCamera(-10, 10, 10, -10, 0.1, 10)));
ecsManager.addSystem(new ThreeSystem());
ecsManager.addSystem(new PongClientNetworkSystem());
ecsManager.start();
