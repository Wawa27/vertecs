import Entity from "../../src/core/Entity";
import { EcsManager } from "../../src";
import ThreeSystem from "../../src/three/ThreeSystem";
import ThreeComponent from "../../src/three/ThreeComponent";

const ecsManager = new EcsManager();

await ecsManager.addSystem(new ThreeSystem());

const cube = new Entity();
cube.addComponent(new ThreeComponent());

ecsManager.addEntity(cube);

await ecsManager.start();
