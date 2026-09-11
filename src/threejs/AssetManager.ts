import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
    Box3,
    CubeTexture,
    CubeTextureLoader,
    Group,
    Texture,
    TextureLoader,
    Vector3,
} from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { Entity } from "../core";
import { Transform } from "../math";
import ThreeObject3DComponent from "./three-object3D.component";
import ThreeAnimationComponent from "./three-animation.component";

const SKYBOX_FACES = ["px", "nx", "py", "ny", "pz", "nz"];

export default class AssetManager {
    static #assets: Map<string, Entity>;

    static #cubeTextures: Map<string, CubeTexture>;

    static gltfLoader: GLTFLoader;

    static fbxLoader: FBXLoader;

    static textureLoader: TextureLoader;

    static cubeTextureLoader: CubeTextureLoader;

    static {
        AssetManager.#assets = new Map();
        AssetManager.#cubeTextures = new Map();
        AssetManager.gltfLoader = new GLTFLoader();
        AssetManager.fbxLoader = new FBXLoader();
        AssetManager.textureLoader = new TextureLoader();
        AssetManager.cubeTextureLoader = new CubeTextureLoader();
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
        gltf.scene.animations.forEach((clip) => {
            clip.name = clip.name.split("|").pop()!;
        });
        gltf.scene.traverse((child) => {
            // @ts-ignore
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        const wrapper = new Group();
        wrapper.add(gltf.scene);

        const box = new Box3().setFromObject(wrapper);
        const size = box.getSize(new Vector3()).length();

        const entity = new Entity();
        entity.addComponent(
            new Transform(undefined, undefined, [2 / size, 2 / size, 2 / size])
        );
        entity.addComponent(new ThreeObject3DComponent(wrapper));
        if (gltf.animations.length > 0) {
            entity.addComponent(new ThreeAnimationComponent());
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

    private static sanitizeClipNames(group: Group) {
        group.animations.forEach((clip) => {
            clip.name = clip.name.split("|").pop()!;
        });
    }

    public static async loadFbx(url: string, assetName: string) {
        const group = await AssetManager.asyncLoadFbx(url);

        group.updateMatrixWorld();

        AssetManager.sanitizeClipNames(group);

        const wrapper = new Group();
        wrapper.add(group);

        const box = new Box3().setFromObject(wrapper);
        const size = box.getSize(new Vector3()).length();

        const entity = new Entity();
        entity.addComponent(
            new Transform(undefined, undefined, [2 / size, 2 / size, 2 / size])
        );
        entity.addComponent(new ThreeObject3DComponent(wrapper));
        if (group.animations.length > 0) {
            entity.addComponent(new ThreeAnimationComponent());
        }

        this.#assets.set(assetName, entity);
    }

    public static async loadAssets(urls: string[]) {
        const skyboxGroups = new Map<string, string[]>();
        const singleFiles: string[] = [];

        urls.forEach((url) => {
            const parts = url.split("/");
            const fileName = parts[parts.length - 1];
            const name = fileName.replace(/\.[^.]+$/, "");
            const dirName = parts[parts.length - 2];

            if (SKYBOX_FACES.includes(name)) {
                if (!skyboxGroups.has(dirName)) {
                    skyboxGroups.set(dirName, []);
                }
                skyboxGroups.get(dirName)!.push(url);
            } else {
                singleFiles.push(url);
            }
        });

        const loaders = singleFiles.map((url) => {
            const ext = url.split(".").pop()?.toLowerCase();
            const name = url
                .split("/")
                .pop()!
                .replace(/\.[^.]+$/, "");

            if (ext === "fbx") {
                return AssetManager.loadFbx(url, name);
            }
            if (ext === "glb" || ext === "gltf") {
                return AssetManager.loadGltf(url, name);
            }
            return AssetManager.loadTexture(url, name);
        });

        skyboxGroups.forEach((faceUrls, dirName) => {
            const ordered = [
                faceUrls.find((u) => u.endsWith("/px.png"))!,
                faceUrls.find((u) => u.endsWith("/nx.png"))!,
                faceUrls.find((u) => u.endsWith("/py.png"))!,
                faceUrls.find((u) => u.endsWith("/ny.png"))!,
                faceUrls.find((u) => u.endsWith("/pz.png"))!,
                faceUrls.find((u) => u.endsWith("/nz.png"))!,
            ];
            loaders.push(AssetManager.loadCubeTexture(ordered, dirName));
        });

        await Promise.all(loaders);
    }

    private static asyncLoadTexture = (url: string): Promise<Texture> =>
        new Promise((resolve, reject) => {
            AssetManager.textureLoader.load(
                url,
                (data) => resolve(data),
                undefined,
                reject
            );
        });

    public static async loadTexture(url: string, assetName: string) {
        const texture = await AssetManager.asyncLoadTexture(url);

        const entity = new Entity();
        entity.addComponent(new ThreeObject3DComponent(texture as any));

        this.#assets.set(assetName, entity);
    }

    private static asyncLoadCubeTexture = (urls: string[]): Promise<Texture> =>
        new Promise((resolve, reject) => {
            AssetManager.cubeTextureLoader.load(
                urls,
                (data) => resolve(data as unknown as Texture),
                undefined,
                reject
            );
        });

    public static async loadCubeTexture(urls: string[], assetName: string) {
        const texture = await AssetManager.asyncLoadCubeTexture(urls);

        this.#cubeTextures.set(assetName, texture as unknown as CubeTexture);

        const entity = new Entity();
        entity.addComponent(new ThreeObject3DComponent(texture as any));

        this.#assets.set(assetName, entity);
    }

    public static getCubeTexture(assetName: string): CubeTexture {
        const texture = AssetManager.#cubeTextures.get(assetName);
        if (!texture) {
            throw new Error(`Cube texture not found: ${assetName}`);
        }
        return texture;
    }

    public static get(assetName: string): Entity {
        const asset = AssetManager.#assets.get(assetName);
        if (!asset) {
            throw new Error(`Asset not found ${assetName}`);
        }
        return asset?.clone();
    }

    public static getAssetNames(): string[] {
        return Array.from(AssetManager.#assets.keys());
    }

    public static isModelAsset(assetName: string): boolean {
        const asset = AssetManager.#assets.get(assetName);
        if (!asset) {
            return false;
        }
        const object3D = asset.getComponent(ThreeObject3DComponent)?.object3D;
        const flagged = object3D as { isMesh?: boolean; isGroup?: boolean };
        return Boolean(flagged && (flagged.isMesh || flagged.isGroup));
    }

    public static set(assetName: string, entity: Entity) {
        return AssetManager.#assets.set(assetName, entity);
    }
}
