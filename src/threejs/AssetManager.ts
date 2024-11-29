import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Box3, Group, Vector3 } from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { Entity } from "../core";
import { Transform } from "../math";
import ThreeObject3D from "./ThreeObject3D";
import ThreeAnimation from "./ThreeAnimation";

export default class AssetManager {
    static #assets: Map<string, Entity>;

    static gltfLoader: GLTFLoader;

    static fbxLoader: FBXLoader;

    static {
        AssetManager.#assets = new Map();
        AssetManager.gltfLoader = new GLTFLoader();
        AssetManager.fbxLoader = new FBXLoader();
    }

    private static asyncLoadGltf = (url: string): Promise<GLTF> =>
        new Promise((resolve, reject) => {
            AssetManager.gltfLoader.load(
                url,
                (data) => resolve(data),
                undefined,
                reject
            );
        });

    public static async loadGltf(url: string, assetName: string) {
        const gltf = await AssetManager.asyncLoadGltf(url);

        gltf.scene.animations = gltf.animations;
        gltf.scene.traverse((child) => {
            // @ts-ignore
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        const box = new Box3().setFromObject(gltf.scene);
        const size = box.getSize(new Vector3()).length();

        const entity = new Entity();
        entity.addComponent(
            new Transform(undefined, undefined, [2 / size, 2 / size, 2 / size])
        );
        entity.addComponent(new ThreeObject3D(gltf.scene));
        if (gltf.animations.length > 0) {
            entity.addComponent(new ThreeAnimation());
        }

        this.#assets.set(assetName, entity);
    }

    private static asyncLoadFbx = (url: string): Promise<Group> =>
        new Promise((resolve, reject) => {
            // @ts-ignore
            AssetManager.fbxLoader.load(
                url,
                (data: Group) => {
                    resolve(data); // Resolve the Promise with the loaded object
                },
                (xhr: ProgressEvent) => {
                    console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`); // Progress log
                },
                (error: unknown) => {
                    reject(error); // Reject the Promise if there's an error
                }
            );
        });

    public static async loadFbx(url: string, assetName: string) {
        const group = await AssetManager.asyncLoadFbx(url);

        group.updateMatrixWorld();

        const box = new Box3().setFromObject(group);
        const size = box.getSize(new Vector3()).length();

        const entity = new Entity();
        entity.addComponent(
            new Transform(undefined, undefined, [2 / size, 2 / size, 2 / size])
        );
        entity.addComponent(new ThreeObject3D(group));
        if (group.animations.length > 0) {
            entity.addComponent(new ThreeAnimation());
        }

        this.#assets.set(assetName, entity);
    }

    public static get(assetName: string): Entity {
        const asset = AssetManager.#assets.get(assetName);
        if (!asset) {
            throw new Error(`Asset not found ${assetName}`);
        }
        return asset?.clone();
    }

    public static set(assetName: string, entity: Entity) {
        return AssetManager.#assets.set(assetName, entity);
    }
}
