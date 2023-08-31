import { EcsManager } from "../../src";
export declare const spawnCube: (position: [number, number, number], scale: [number, number, number], rotation: [number, number, number]) => void;
export declare const spawnSphere: (position: [number, number, number], radius: number) => void;
export declare const initializeBoilerplate: () => Promise<EcsManager>;
