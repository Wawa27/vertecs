/// <reference types="OimoComponent.ts" />
/// <reference types="oimo.d.ts" />
/// <reference types="OimoSystem.ts" />
import { Camera, Object3D, Scene, WebGLRenderer, AnimationAction, AnimationClip, AnimationMixer, Light, InstancedMesh } from "three";
import { Vec3, Mat4, Mat4Like, Quat, QuatLike, Vec3Like } from "ts-gl-matrix";
import { WebSocket } from "ws";
// @ts-ignore
import { CSS3DObject } from "three/addons/renderers/CSS3DRenderer.js";
// @ts-ignore
import { BodyOptions, Body } from "oimo";
type SystemConstructor<T extends Component[]> = new (...args: any[]) => System<T>;
/**
 * A system loops over all entities and uses the components of the entities to perform logic.
 */
declare abstract class System<T extends Component[] = [
]> {
    #private;
    protected ecsManager?: EcsManager;
    readonly filter: ComponentClass<T[number]>[];
    $dependencies: SystemConstructor<Component[]>[];
    /**
     * Create a new system with the given component group filter and the given tps
     */
    protected constructor(filter: ComponentClass<T[number]>[], tps?: number, dependencies?: SystemConstructor<Component[]>[]);
    /**
     * Called every frame, you should not call this method directly but instead use the {@see onLoop} method
     */
    loop(components: T[], entities: Entity[]): void;
    start(ecsManager: EcsManager): Promise<void>;
    stop(): Promise<void>;
    sleep(milliseconds: number): void;
    /**
     * Called when the system is added to an ecs manager
     * @param ecsManager
     */
    onAddedToEcsManager(ecsManager: EcsManager): void;
    /**
     * Called when the system is added to an ecs manager
     */
    initialize(): Promise<void>;
    /**
     * Called when the system is ready to start
     */
    onStart(): Promise<void>;
    /**
     * Called when the system is stopped
     */
    onStop(): Promise<void>;
    /**
     * Called whenever an entity becomes eligible to a system
     * An entity becomes eligible when a component is added to an entity making it eligible to a group,
     * or when a new system is added and an entity was already eligible to the new system's group
     */
    onEntityEligible(entity: Entity, components: T): void;
    /**
     * Called when an entity becomes ineligible to a system, and before it is removed from the system
     */
    onEntityNoLongerEligible(entity: Entity, components: T): void;
    /**
     * Called every frame
     * @param components
     * @param entities
     * @param deltaTime The time since the last loop
     */
    protected abstract onLoop(components: T[], entities: Entity[], deltaTime: number): void;
    /**
     * Return the time since the last update
     * @private
     */
    private getDeltaTime;
    /**
     * Return true if enough time has passed since the last update, false otherwise
     */
    hasEnoughTimePassed(): boolean;
    get dependencies(): SystemConstructor<Component[]>[];
    get lastUpdateTime(): number;
    set lastUpdateTime(value: number);
    get loopTime(): number;
    get tps(): number;
    set tps(value: number);
    get hasStarted(): boolean;
    set hasStarted(value: boolean);
}
type EcsGroup = {
    entities: Entity[];
    components: Component[][];
    systems: System<any>[];
};
type SystemConstructor$0<T extends System> = new (...args: any[]) => T;
/**
 * The system manager is responsible for managing all the systems
 */
declare class EcsManager {
    #private;
    readonly ecsGroups: Map<ComponentClass[], EcsGroup>;
    isStarted: boolean;
    constructor();
    /**
     * Create a new entity and add it to this ecs manager
     * @param options
     */
    createEntity(options?: EntityOptions): Entity;
    /**
     * Add a system to the system manager
     */
    addSystem(system: System<any>): Promise<void>;
    removeSystem(SystemConstructor: SystemConstructor$0<any>): void;
    /**
     * The entry point of the ECS engine
     */
    start(): Promise<void>;
    stop(): Promise<void>;
    /**
     * Add multiple entities to the system manager
     */
    addEntities(entities: Entity[]): void;
    /**
     * Add an entity to the system manager
     */
    addEntity(newEntity: Entity): void;
    removeEntity(entity: Entity): void;
    destroyEntity(entityId: string): void;
    /**
     * Loop through all the systems and call their loop method, this method should not be called manually,
     * see {@link start}
     */
    loop(): void;
    /**
     * Check if an entity components is eligible to a group filter
     */
    isEntityEligibleToGroup(group: ComponentClass[], entity: Entity): boolean;
    /**
     * Called after a component is added to an entity
     * @param entity
     * @param component
     */
    onComponentAddedToEntity(entity: Entity, component: Component): void;
    findSystem<T extends System<any>>(SystemConstructor: SystemConstructor$0<T>): T | undefined;
    /**
     * Called after a component is removed from an entity
     * This method will check if the entity is still eligible to the groups and flag it for deletion if not
     * @param entity
     * @param component
     */
    onComponentRemovedFromEntity(entity: Entity, component: Component): void;
    get entities(): Entity[];
    get loopTime(): number;
}
interface EntityOptions {
    id?: string;
    name?: string;
    components?: Component[];
    children?: Entity[];
    ecsManager?: EcsManager;
    parent?: Entity;
}
/**
 * An entity is a general purpose object which contains components
 */
declare class Entity {
    #private;
    constructor(options?: EntityOptions);
    /**
     * Find an entity by it's id
     * @param ecsManager
     * @param id The entity id to find
     */
    static findById(ecsManager: EcsManager, id: string): Entity | undefined;
    /**
     * Find an entity by a component
     * @param ecsManager
     * @param component The component class
     */
    static findByComponent(ecsManager: EcsManager, component: ComponentClass): Entity | undefined;
    /**
     * Find an entity by a component
     * @param ecsManager The ecs manager
     * @param component The component class
     */
    static findAllByComponent(ecsManager: EcsManager, component: ComponentClass): Entity[];
    /**
     * Find an entity by a tag
     * @param ecsManager
     * @param tag The tag
     */
    static findAllByTag(ecsManager: EcsManager, tag: string): Entity[];
    /**
     * Return the first child found with the specified name
     * @param name The child name
     */
    findChildByName(name: string): Entity | undefined;
    /**
     * Find the first entity in the entity hierarchy with the specified component
     * @param component
     */
    findWithComponent(component: ComponentClass): Entity | undefined;
    /**
     * Return a component by its class
     * @param componentClass The component's class or subclass constructor
     */
    getComponent<T extends Component>(componentClass: ComponentClass<T>): T | undefined;
    /**
     * Return the first component found in an entity hierarchy
     * @param componentConstructor The component's class or subclass constructor
     */
    findComponent<T extends Component>(componentConstructor: ComponentClass<T>): T | undefined;
    /**
     * Return all components present in the entity
     * @param filter
     */
    getComponents<T extends Component>(filter?: ComponentClass<T>[]): (T | undefined)[];
    /**
     * Add a component to this entity
     * @param newComponent The component to add
     */
    addComponent(newComponent: Component): void;
    addComponents(...newComponents: Component[]): void;
    /**
     * Add a child to this entity
     * @param entity The child
     */
    addChild(entity: Entity): void;
    /**
     * Add a tag to an entity
     * @param tag The tag to add
     */
    addTag(tag: string): void;
    /**
     * Remove a components from this entity
     * @param componentClass The component's class to remove
     */
    removeComponent<T extends Component>(componentClass: ComponentClass<T>): T | undefined;
    /**
     * Clone an entity's name, components, recursively
     */
    clone(id?: string): Entity;
    /**
     * Destroy this entity, remove and destroy all added components
     */
    destroy(): void;
    get ecsManager(): EcsManager | undefined;
    set ecsManager(value: EcsManager | undefined);
    get tags(): string[];
    get root(): Entity;
    set root(value: Entity);
    get components(): Component[];
    get parent(): Entity | undefined;
    set parent(entity: Entity | undefined);
    get name(): string | undefined;
    set name(value: string | undefined);
    get children(): Entity[];
    get id(): string;
}
type ComponentClass<T extends Component = any> = Function & {
    prototype: T;
};
/**
 * A component is a piece of data that is attached to an entity
 */
declare abstract class Component {
    #private;
    /**
     * The entity this component is attached to
     * @protected
     */
    protected $entity?: Entity;
    /**
     * Create a new component
     */
    protected constructor(id?: string);
    /**
     * Called when the component is added to the entity
     */
    onAddedToEntity(entity: Entity): void;
    /**
     * Called when the component is removed from the entity
     */
    onRemovedFromEntity(entity: Entity): void;
    /**
     * Called when the attached entity has a new parent
     * This method is called before the parent is updated
     * @param entity The new parent entity
     */
    onEntityNewParent(entity?: Entity): void;
    /**
     * Called when another component is added to the attached entity
     * @param component
     */
    onComponentAddedToAttachedEntity(component: Component): void;
    /**
     * This method is called when the {@see destroy} method is called
     */
    onDestroyed(): void;
    /**
     * Return a new clone of this component, by default, it returns the same component
     */
    clone(): Component;
    get id(): string;
    get entity(): Entity | undefined;
    set entity(value: Entity | undefined);
}
declare class PrefabManager {
    #private;
    private constructor();
    static add(name: string, prefab: Entity): void;
    static get(name: string, id?: string): Entity | undefined;
}
/**
 * The json representation of a serialized component
 */
interface SerializedComponent<T> {
    id?: string;
    data: T;
    className: string;
}
/**
 * A serializable component is a component that can be serialized and deserialized,
 * it is used to send components over network or to save them to a file for example
 */
declare abstract class SerializableComponent<T> extends Component {
    protected constructor(options?: {
        id?: string;
    });
    serialize(addMetadata?: boolean): SerializedComponent<T>;
    deserialize(serializedComponent: SerializedComponent<T>): void;
    /**
     * Serialize the component's data into a json object that can be sent over the networking
     */
    abstract write(): T;
    /**
     * Deserialize the json object, the data should come from a trusted source
     * @param data
     */
    abstract read(data: T): void;
}
type NetworkData = {
    parent: string;
};
type NetworkScope = "public" | "private";
/**
 * This component is used to mark an entity as networked, it is used by the network systems to determine which entities to send to which clients.
 */
declare class IsNetworked extends NetworkComponent<NetworkData> {
    #private;
    constructor(ownerId?: string, scope?: NetworkScope);
    accept(data: NetworkData): boolean;
    read(data: NetworkData): void;
    write(): NetworkData;
    isDirty(): boolean;
}
type SerializedNetworkComponent<T> = SerializedComponent<T> & {
    updateTimestamp: number;
    ownerId?: string;
    scope?: NetworkScope;
};
/**
 * A network component is a component that is used to synchronize data over the network.
 * Components that inherit from this class will be synchronized over the network if they are attached to a networked entity.
 */
declare abstract class NetworkComponent<T> extends SerializableComponent<T> {
    #private;
    protected $updateTimestamp: number;
    $forceUpdate: boolean;
    protected constructor(ownerId?: string, scope?: NetworkScope);
    serialize(addNetworkMetadata?: boolean): SerializedNetworkComponent<T>;
    deserialize(serializedComponent: SerializedNetworkComponent<T>): void;
    /**
     * Server-side only. Return true if the component can be updated from the client.
     * @param data
     */
    abstract accept(data: T): boolean;
    /**
     * Check for data synchronization, return true if the data is dirty and need to be sent over the networking
     */
    abstract isDirty(lastData: T): boolean;
    get scope(): NetworkScope;
    set scope(value: NetworkScope);
    get ownerId(): string;
    set ownerId(value: string);
    get forceUpdate(): boolean;
    set forceUpdate(value: boolean);
    get lastData(): T | undefined;
    get updateTimestamp(): number | undefined;
    set updateTimestamp(value: number | undefined);
}
/**
 * The json representation of an entity
 */
declare class SerializedEntity {
    protected $id: string;
    protected $components: Map<string, SerializedComponent<any>>;
    protected $name?: string;
    protected $destroyed?: boolean;
    protected $parent?: string;
    protected $prefabName?: string;
    constructor(id: string, components: Map<string, SerializedNetworkComponent<any>>, name?: string, destroyed?: boolean, parent?: string, prefabName?: string);
    toJSON(): any;
    static reviver(key: string, value: any): any;
    // TODO: Move to network entity
    get destroyed(): boolean | undefined;
    set destroyed(value: boolean | undefined);
    get parent(): string | undefined;
    set parent(value: string | undefined);
    get prefabName(): string | undefined;
    get id(): string;
    get name(): string | undefined;
    get components(): Map<string, SerializedComponent<any>>;
}
declare class IoUtils {
    /**
     * Imports an entity from a json string
     * @param ComponentClasses The list of component classes to import
     * @param serializedEntityJson
     */
    static import(ComponentClasses: ComponentClass[], serializedEntityJson: string): Entity;
    /**
     * Exports an entity to a json string
     * @param entity
     */
    static export(entity: Entity): string;
}
declare class ThreeCamera extends Component {
    #private;
    constructor(camera: Camera, lookAt?: Entity, lookAtOffset?: Vec3, id?: string, update?: boolean);
    get orbitControls(): boolean;
    get lookAtOffset(): Vec3;
    set lookAtOffset(value: Vec3);
    get lookAt(): Entity | undefined;
    set lookAt(value: Entity | undefined);
    get camera(): Camera;
    set camera(value: Camera);
}
declare class ThreeObject3D extends Component {
    #private;
    constructor(object3D: Object3D, id?: string);
    get object3D(): Object3D;
    set object3D(value: Object3D);
    get isVisible(): boolean;
    set isVisible(value: boolean);
    clone(): ThreeObject3D;
}
declare class Transform extends Component {
    #private;
    /**
     * The result of the post-multiplication of all the parents of this transform
     * This matrix is only updated when queried and dirty
     * @private
     */
    readonly modelToWorldMatrix: Mat4;
    /**
     * The inverse of {@see modelToWorldMatrix}
     * This matrix is only updated when queried and dirty
     * @private
     */
    readonly worldToModelMatrix: Mat4;
    /**
     * The result of Translation * Rotation * Scale
     * This matrix is only updated when queried and dirty
     * @private
     */
    readonly modelMatrix: Mat4;
    /**
     * The current position
     * @private
     */
    readonly position: Vec3;
    /**
     * The current rotation
     * @private
     */
    readonly rotation: Quat;
    /**
     * The current scale
     * @private
     */
    readonly scaling: Vec3;
    dirty: boolean;
    forward: Vec3;
    /**
     * The parent transform
     * @private
     */
    parent?: Transform;
    /**
     * Creates a new transform
     * @param translation Specifies the translation, will be copied using {@link Vec3.copy}
     * @param rotation Specifies the rotation, will be copied using {@link Quat.copy}
     * @param scaling Specifies the scale, will be copied using {@link Vec3.copy}
     * @param forward Specifies the forward vector, will be copied using {@link Vec3.copy}
     */
    constructor(translation?: Vec3Like, rotation?: QuatLike, scaling?: Vec3Like, forward?: Vec3);
    /**
     * Set this transform's parent to the entity's parent
     * @param entity The entity this transform is attached to
     */
    onAddedToEntity(entity: Entity): void;
    /**
     * Remove this transform's parent
     * @param entity The entity this transform was attached to
     */
    onRemovedFromEntity(entity: Entity): void;
    /**
     * Called whenever the attached entity parent change
     * @param parent The new parent entity
     */
    onEntityNewParent(parent: Entity): void;
    private setNewParent;
    onDestroyed(): void;
    static fromMat4(matrix: Mat4): Transform;
    /**
     * Copy the translation, rotation and scaling of the transform
     * @param transform The transform to copy from
     */
    copy(transform: Mat4): void;
    /**
     * Translate this transform using a translation vector
     * @param translation The translation vector
     */
    translate(translation: Vec3Like): void;
    setWorldRotation(rotation: QuatLike): void;
    /**
     * Reset the position, rotation, and scale to the default values
     */
    reset(): void;
    /**
     * Reset the rotation to the default values
     */
    resetRotation(): void;
    /**
     * Rotate this transform in the x axis
     * @param x An angle in radians
     */
    rotateX(x: number): void;
    /**
     * Rotate this transform in the y axis
     * @param y An angle in radians
     */
    rotateY(y: number): void;
    /**
     * Rotate this transform in the y axis
     * @param z An angle in radians
     */
    rotateZ(z: number): void;
    rotate(rotation: QuatLike): void;
    setWorldScale(scale: Vec3Like): void;
    scale(scale: Vec3Like): void;
    setScale(scale: Vec3Like): void;
    setRotationQuat(rotation: QuatLike): void;
    /**
     * Updates the model to world matrix of this transform and returns it
     * It update all the parents until no one is dirty
     */
    updateModelToWorldMatrix(): Mat4;
    getWorldToModelMatrix(): Mat4Like;
    getWorldPosition(): Vec3;
    /**
     * Get the world scale of this transform
     */
    getWorldScale(): Vec3;
    /**
     * Get the world rotation of this transform
     */
    getWorldRotation(): Quat;
    getWorldForwardVector(out: Vec3): Vec3;
    getVectorInModelSpace(out: Vec3, vector: Vec3Like): Vec3;
    getVectorInWorldSpace(out: Vec3, vector: Vec3): Vec3;
    toWorldScale(out: Vec3, scale: Vec3Like): Vec3;
    /**
     * Make this transform look at the specified position
     * @param x
     * @param y
     * @param z
     */
    lookAtXyz(x: number, y: number, z: number): void;
    lookAt(position: Vec3): void;
    setWorldUnitScale(): void;
    setWorldPosition(position: Vec3Like): void;
    /**
     * Set the current position
     * @param position Specifies the new position, will be copied using {@link Vec3.copy}
     */
    setPosition(position: Vec3Like): void;
    setForward(forward: Vec3Like): void;
    /**
     * Return a new Transform with the same position, rotation, scaling, but no parent
     */
    clone(): Component;
}
declare class MathUtils {
    static getEulerToDegrees(radians: number): number;
    /**
     * Convert a quaternion to euler angles.
     * Missing function from gl-matrix
     * @param quat
     * @param out
     */
    static getEulerFromQuat(out: Vec3Like, quat: QuatLike): Vec3Like;
}
declare class ThreeSystem extends System<[
    Transform,
    ThreeObject3D
]> {
    #private;
    constructor(tps?: number);
    onAddedToEcsManager(ecsManager: EcsManager): void;
    onEntityEligible(entity: Entity, components: [
        Transform,
        ThreeObject3D
    ]): void;
    onEntityNoLongerEligible(entity: Entity, components: [
        Transform,
        ThreeObject3D
    ]): void;
    onStart(): Promise<void>;
    protected onLoop(components: [
        Transform,
        ThreeObject3D
    ][], entities: Entity[], deltaTime: number): void;
    get camera(): Camera;
    get renderer(): WebGLRenderer;
    get scene(): Scene;
}
declare class ThreeAnimation extends Component {
    #private;
    constructor();
    onAddedToEntity(entity: Entity): void;
    onComponentAddedToAttachedEntity(component: Component): void;
    private createMixer;
    playAnimation(animationName?: string): void;
    stopAnimation(): void;
    get currentAnimation(): AnimationAction | undefined;
    get mixer(): AnimationMixer | undefined;
    get clips(): AnimationClip[] | undefined;
}
/**
 * Represents an animation being played on an entity
 */
declare class Animation extends Component {
    #private;
    constructor(name: string, duration: number, repeat: number, startTime: number);
    get name(): string;
    set name(name: string);
    get duration(): number;
    set duration(duration: number);
    get startTime(): number;
    set startTime(startTime: number);
    get repeat(): number;
    set repeat(repeat: number);
    clone(): Component;
}
declare class IsPrefab extends Component {
    #private;
    constructor(prefabName: string);
    get prefabName(): string;
    set prefabName(prefabName: string);
}
declare abstract class State extends Component {
    protected constructor(id?: string);
}
declare class FiniteStateMachine extends Component {
    protected $inialStateName: string;
    protected $currentStateName?: string;
    protected $states: Map<string, State>;
    protected $transitions: Map<string, Map<string, State>>;
    constructor(initialStateName: string, states?: {
        name: string;
        state: State;
    }[], transitions?: {
        stateName: string;
        nextStateNames: string[];
    }[]);
    addState(name: string, state: State): void;
    addStates(states: {
        name: string;
        state: State;
    }[]): void;
    addTransition(stateName: string, nextStateNames: string[]): void;
    addTransitions(transitions: {
        stateName: string;
        nextStateNames: string[];
    }[]): void;
    setNextState(nextStateName: string): void;
    getCurrentState(): State | undefined;
    get initialStateName(): string;
    set currentStateName(currentStateName: string);
    get currentStateName(): string | undefined;
    clone(): Component;
}
declare class FiniteStateMachineSystem extends System<[
    FiniteStateMachine
]> {
    constructor(tps?: number);
    onEntityEligible(entity: Entity, components: [
        FiniteStateMachine
    ]): void;
    protected onLoop(components: [
        FiniteStateMachine
    ][], entities: Entity[], deltaTime: number): void;
}
declare abstract class StateSystem<T extends State> extends System<[
    T
]> {
    protected constructor(StateClass: new (...args: any[]) => T, tps?: number, dependencies?: any[]);
}
/**
 * JSON representation of an entity that is synchronized over the network.
 */
declare class NetworkEntity extends SerializedEntity {
    constructor(id: string, components: Map<string, SerializedNetworkComponent<any>>, name?: string, prefabName?: string);
    toJSON(): any;
    static reviver(key: string, value: any): any;
    get components(): Map<string, SerializedNetworkComponent<any>>;
}
type CustomData = {
    [key: string]: any;
    scope: string;
};
declare class GameState {
    #private;
    constructor();
    clone(): GameState;
    toJSON(): {
        timestamp: number;
        entities: [
            string,
            SerializedEntity
        ][];
        customData: any[];
    };
    static reviver(key: string, value: any): any;
    get timestamp(): number;
    set timestamp(value: number);
    get entities(): Map<string, NetworkEntity>;
    set entities(value: Map<string, NetworkEntity>);
    get customData(): CustomData[];
    set customData(value: CustomData[]);
}
declare class ClientHandler {
    #private;
    protected ecsManager: EcsManager;
    protected $webSocket: WebSocket;
    readonly $clientEntity: Entity;
    constructor(clientEntity: Entity, ecsManager: EcsManager, webSocket: WebSocket);
    onConnect(): void;
    onDisconnect(): void;
    sendMessage(message: GameState): void;
    sendCustomData(data: any): void;
    onPrivateCustomData(data: any): void;
    get webSocket(): WebSocket;
    get forceUpdate(): boolean;
    set forceUpdate(forceUpdate: boolean);
    get clientSnapshot(): GameState | undefined;
    set clientSnapshot(snapshot: GameState | undefined);
    get clientEntity(): Entity;
    get customData(): CustomData[];
}
/**
 * The networking system is responsible for sending and receiving entities over the networking.
 * This class is used by the server and the client to provide a common interface for formatting entities.
 */
declare class NetworkSystem extends System<[
    IsNetworked
]> {
    #private;
    protected $currentSnapshot: GameState;
    $allowedNetworkComponents: ComponentClass<Component>[];
    constructor(allowedNetworkComponents: ComponentClass[], tps?: number);
    protected onLoop(components: [
        IsNetworked
    ][], entities: Entity[], deltaTime: number): void;
    /**
     * Deserialize the components of the serialized entity and add them to the target entity.
     * @param serializedEntity
     */
    protected deserializeEntity(serializedEntity: NetworkEntity): void;
    protected deserializeComponent(serializedNetworkComponent: SerializedNetworkComponent<any>, targetEntity: Entity): void;
    protected serializeEntity(entity: Entity): NetworkEntity | undefined;
    protected serializeComponent(component: NetworkComponent<any>): SerializedNetworkComponent<any> | undefined;
    /**
     *
     * @param snapshot
     * @param entity
     * @param component
     */
    isOutOfSync(snapshot: GameState, entity: SerializedEntity, component: SerializedNetworkComponent<any>): boolean;
    get allowedNetworkComponents(): ComponentClass[];
}
type ClientHandlerConstructor = new (playerEntity: Entity, ecsManager: EcsManager, webSocket: WebSocket) => ClientHandler;
/**
 * This class is responsible for managing all the clients connected to the server.
 */
declare class ServerNetworkSystem extends NetworkSystem {
    #private;
    protected $clientHandlers: ClientHandler[];
    constructor(allowedNetworkComponents: ComponentClass[], clientHandlerConstructor: ClientHandlerConstructor, tps?: number);
    onStart(): Promise<void>;
    onStop(): Promise<void>;
    onEntityEligible(entity: Entity, components: [
        IsNetworked
    ]): void;
    onEntityNoLongerEligible(entity: Entity, components: [
        IsNetworked
    ]): void;
    protected onLoop(components: [
        IsNetworked
    ][], entities: Entity[], deltaTime: number): void;
    deserializeComponent(networkComponent: SerializedNetworkComponent<any>, targetEntity: Entity): void;
    /**
     * Broadcasts custom data to all clients.
     * @param data
     */
    broadcastCustomData(data: any): void;
    sendCustomDataToClient(clientId: string, data: any): void;
}
/**
 * Entry point for the client-side networking.
 * This system is responsible for sending and receiving entities over the networking.
 * It must be extended to provide a custom listener for various events.
 */
declare abstract class ClientNetworkSystem extends NetworkSystem {
    #private;
    protected $serverSnapshot?: GameState;
    protected constructor(allowedNetworkComponents: ComponentClass[], address: string, tps?: number);
    onStart(): Promise<void>;
    onStop(): Promise<void>;
    onEntityEligible(entity: Entity): void;
    protected onLoop(components: [
        IsNetworked
    ][], entities: Entity[], deltaTime: number): void;
    private setup;
    deserializeEntity(networkEntity: NetworkEntity): void;
    /**
     * Serialize the entity only if it is networked and owned by the client.
     * @param entity
     */
    serializeEntity(entity: Entity): NetworkEntity | undefined;
    sendCustomPrivateData(data: any): void;
    /**
     * Called when the client is connected to the server.
     * @protected
     */
    protected abstract onConnect(): void;
    /**
     * Called when the client is disconnected from the server.
     * @protected
     */
    protected abstract onDisconnect(): void;
    /**
     * Called when the client received a new entity from the server.
     * @protected
     */
    protected abstract onNewEntity(entity: Entity): void;
    /**
     * Called when an entity is deleted from the server.
     * @protected
     */
    protected abstract onDeletedEntity(entity: Entity): void;
    protected onCustomData(customPrivateData: any): void;
    get networkId(): string | undefined;
}
/**
 * The component that is used to store the client metadata
 */
declare class ClientComponent extends Component {
    constructor();
}
type TransformData = {
    position: [
        number,
        number,
        number
    ];
    rotation: [
        number,
        number,
        number,
        number
    ];
    scale: [
        number,
        number,
        number
    ];
};
declare class NetworkTransform extends NetworkComponent<TransformData> {
    constructor();
    onAddedToEntity(entity: Entity): void;
    accept(data: TransformData): boolean;
    read(data: TransformData): void;
    isDirty(lastData: TransformData): boolean;
    write(): TransformData;
    clone(): Component;
}
type AnimationData = {
    name: string;
    duration: number;
    startTime: number;
    repeat: number;
};
/**
 * Represents an animation being played on an entity
 */
declare class NetworkAnimation extends NetworkComponent<AnimationData> {
    constructor();
    accept(data: AnimationData): boolean;
    isDirty(lastData: AnimationData): boolean;
    read(data: AnimationData): void;
    write(): AnimationData;
    clone(): Component;
}
declare class NetworkFiniteStateMachine extends NetworkComponent<string> {
    constructor();
    accept(stateName: string): boolean;
    isDirty(lastStateName?: string): boolean;
    write(): string;
    read(stateName: string): void;
    clone(): NetworkFiniteStateMachine;
}
declare class TimedState extends Component {
    #private;
    constructor(duration: number, repeat: number, nextStateName?: string);
    get duration(): number;
    get repeat(): number;
    get startTime(): number;
    set startTime(startTime: number);
    get nextStateName(): string | undefined;
}
declare class TimedStateSystem extends System<[
    FiniteStateMachine,
    TimedState
]> {
    constructor();
    onEntityEligible(entity: Entity, components: [
        FiniteStateMachine,
        TimedState
    ]): void;
    onLoop(components: [
        FiniteStateMachine,
        TimedState
    ][], entities: Entity[], deltaTime: number): void;
}
declare class ThreeAnimationSystem extends System<[
    ThreeAnimation,
    Animation
]> {
    constructor(tps?: number);
    onEntityEligible(entity: Entity, components: [
        ThreeAnimation,
        Animation
    ]): void;
    onEntityNoLongerEligible(entity: Entity, components: [
        ThreeAnimation,
        Animation
    ]): void;
    onStart(): Promise<void>;
    protected onLoop(components: [
        ThreeAnimation,
        Animation
    ][], entities: Entity[], deltaTime: number): void;
}
declare class ThreeCameraSystem extends System<[
    ThreeCamera,
    Transform
]> {
    #private;
    constructor(renderer: WebGLRenderer, tps?: number);
    onStart(): Promise<void>;
    onEntityEligible(entity: Entity, components: [
        ThreeCamera,
        Transform
    ]): void;
    protected onLoop(components: [
        ThreeCamera,
        Transform
    ][], entities: Entity[], deltaTime: number): void;
    get cameraEntity(): Entity | undefined;
}
declare class ThreeLightComponent extends Component {
    #private;
    constructor(light: Light, target?: Entity, castShadow?: boolean);
    get target(): Entity | undefined;
    get light(): Light;
}
declare class ThreeLightSystem extends System<[
    ThreeLightComponent,
    Transform
]> {
    #private;
    constructor(scene: Scene, tps?: number);
    onEntityEligible(entity: Entity, components: [
        ThreeLightComponent,
        Transform
    ]): void;
    onEntityNoLongerEligible(entity: Entity, components: [
        ThreeLightComponent,
        Transform
    ]): void;
    protected onLoop(components: [
        ThreeLightComponent,
        Transform
    ][], entities: Entity[], deltaTime: number): void;
}
declare class ThreeCss3dComponent extends Component {
    #private;
    constructor(htmlElement: HTMLElement, id?: string);
    get css3dObject(): CSS3DObject;
}
declare class ThreeCss3dSystem extends System<[
    ThreeCss3dComponent,
    Transform
]> {
    #private;
    constructor(threeSystem: ThreeSystem, tps?: number);
    onEntityEligible(entity: Entity, components: [
        ThreeCss3dComponent,
        Transform
    ]): void;
    onEntityNoLongerEligible(entity: Entity, components: [
        ThreeCss3dComponent,
        Transform
    ]): void;
    protected onLoop(components: [
        ThreeCss3dComponent,
        Transform
    ][], entities: Entity[], deltaTime: number): void;
}
declare class ThreeComponentDebugger extends Component {
    constructor();
    onAddedToEntity(entity: Entity): void;
}
declare class ThreeInstancedMesh extends ThreeObject3D {
    #private;
    constructor(instancedMesh: InstancedMesh, id?: string);
    onAddedToEntity(entity: Entity): void;
    onRemovedFromEntity(entity: Entity): void;
    getEntityIndex(entityId: string): number;
    get entities(): string[];
    clone(): ThreeInstancedMesh;
}
declare class AnimatedState extends TimedState {
    #private;
    constructor(animationName: string, duration: number, repeat: number, nextStateName?: string);
    get name(): string;
}
/**
 * System for handling animated states
 */
declare class AnimatedStateSystem extends System<[
    AnimatedState
]> {
    constructor();
    onEntityEligible(entity: Entity, components: [
        AnimatedState
    ]): void;
    protected onLoop(components: [
        AnimatedState
    ][], entities: Entity[], deltaTime: number): void;
    onEntityNoLongerEligible(entity: Entity, components: [
        AnimatedState
    ]): void;
}
declare abstract class KeyboardInputSystem extends System<[
    Component
]> {
    #private;
    protected constructor(filter: ComponentClass[], canvasId: string, tps?: number);
    initialize(): Promise<void>;
    abstract onKeyDown(key: string): void;
    abstract onKeyRepeat(key: string): void;
    abstract onKeyUp(key: string): void;
    onLoop(): void;
}
declare abstract class MouseInputSystem extends System<[
]> {
    #private;
    protected constructor(canvasId?: string, tps?: number);
    initialize(): Promise<void>;
    onLoop(components: [
    ], entities: Entity[]): void;
    abstract onMouseMove(event: MouseEvent): void;
    abstract onMouseDown(event: MouseEvent): void;
    abstract onMouseUp(event: MouseEvent): void;
    abstract onMouseWheel(event: WheelEvent): void;
}
type OimoComponentOptions = Exclude<BodyOptions, "rot" | "pos">;
declare class OimoComponent extends Component {
    #private;
    constructor(bodyOptions: OimoComponentOptions);
    get bodyOptions(): BodyOptions;
    get body(): Body | undefined;
    set body(body: Body | undefined);
    clone(): Component;
}
declare class OimoSystem extends System<[
    OimoComponent,
    Transform
]> {
    #private;
    constructor(tps?: number);
    onStart(): Promise<void>;
    onEntityEligible(entity: Entity, components: [
        OimoComponent,
        Transform
    ]): void;
    protected onLoop(components: [
        OimoComponent,
        Transform
    ][], entities: Entity[], deltaTime: number): void;
}
declare class AxisAlignedBoundingBox {
    #private;
    constructor(min: Vec3Like, max: Vec3Like);
    contains(point: Vec3Like): boolean;
    intersects(other: AxisAlignedBoundingBox): boolean;
    get minimum(): Vec3Like;
    get maximum(): Vec3Like;
}
type PhysicsData = {
    movable: boolean;
    [key: string]: any;
};
type BodyOptions$0 = {
    movable?: boolean;
    mass?: number;
};
declare abstract class Body$0 extends SerializableComponent<PhysicsData> {
    protected $movable: boolean;
    protected $boundingBox: AxisAlignedBoundingBox;
    protected $mass: number;
    protected constructor(bodyOptions?: BodyOptions$0);
    abstract getBoundingBox(): AxisAlignedBoundingBox;
    abstract read(data: PhysicsData): void;
    abstract write(): PhysicsData;
    hasMoved(): boolean;
    get mass(): number;
    get movable(): boolean;
    set movable(movable: boolean);
    abstract clone(): Component;
}
declare class Ray {
    #private;
    constructor(origin: Vec3Like, direction: Vec3Like);
    getSphereIntersection(sphereEntity: Entity): Vec3Like | undefined;
    get origin(): Vec3Like;
    get direction(): Vec3Like;
}
declare class PhysicsSystem extends System<[
    Body$0,
    Transform
]> {
    #private;
    constructor(tps?: number);
    onEntityEligible(entity: Entity, components: [
        Body$0,
        Transform
    ]): void;
    onEntityNoLongerEligible(entity: Entity, components: [
        Body$0,
        Transform
    ]): void;
    protected onLoop(components: [
        Body$0,
        Transform
    ][], entities: Entity[], deltaTime: number): void;
    findEntitiesFromRaycast(ray: Ray): Entity[];
    private applyGravity;
}
type SphereBodyOptions = BodyOptions$0 & {
    radius: number;
};
declare class SphereBody extends Body$0 {
    #private;
    constructor(sphereBodyOptions: SphereBodyOptions);
    getBoundingBox(): AxisAlignedBoundingBox;
    get radius(): number;
    set radius(radius: number);
    read(data: PhysicsData): void;
    write(): PhysicsData;
    clone(): SphereBody;
}
interface Narrowphase {
    getSphereSphereCollision(sphere1Position: Vec3, sphere1Shape: SphereBody, sphere2Position: Vec3, sphere2Shape: SphereBody): Vec3 | undefined;
}
declare class DefaultNarrowphase implements Narrowphase {
    constructor();
    getSphereSphereCollision(sphere1Position: Vec3, sphere1Shape: SphereBody, sphere2Position: Vec3, sphere2Shape: SphereBody): Vec3 | undefined;
}
declare abstract class Broadphase {
    constructor();
    abstract onEntityAdded(entity: Entity, components: [
        Body$0,
        Transform
    ]): void;
    abstract onEntityRemoved(entity: Entity, components: [
        Body$0,
        Transform
    ]): void;
    abstract onEntityMoved(entity: Entity, components: [
        Body$0,
        Transform
    ]): void;
    abstract getCollisionPairs(entities: Entity[]): [
        Entity,
        Entity
    ][];
}
/**
 * A brute force approach to broadphase, it checks every entity with every other entity
 */
declare class BruteForceBroadphase extends Broadphase {
    constructor();
    onEntityAdded(entity: Entity): void;
    getCollisionPairs(entities: Entity[]): [
        Entity,
        Entity
    ][];
    onEntityRemoved(entity: Entity): void;
    onEntityMoved(entity: Entity): void;
}
declare class Collision extends Component {
    #private;
    constructor(position: Vec3Like, collidingWith: Entity);
    get position(): Vec3Like;
    get collidingWith(): Entity;
}
/**
 * Simple solver that pushes the bodies away from each other
 */
declare class DefaultSolver {
    solve(entity1: Entity, entity2: Entity, contactNormal: Vec3Like): void;
    clone(): DefaultSolver;
}
declare class BodyDebugger extends Component {
    constructor();
    onAddedToEntity(entity: Entity): void;
    onRemovedFromEntity(entity: Entity): void;
}
type SphereBodyData = {
    movable: boolean;
    radius: number;
};
declare class NetworkSphereBody extends NetworkComponent<SphereBodyData> {
    constructor();
    onAddedToEntity(entity: Entity): void;
    accept(data: SphereBodyData): boolean;
    isDirty(): boolean;
    read(data: SphereBodyData): void;
    write(): SphereBodyData;
    clone(): NetworkSphereBody;
}
type CubeBodyData = {
    movable: boolean;
    width: number;
    height: number;
    depth: number;
};
declare class NetworkSphereBody$0 extends NetworkComponent<CubeBodyData> {
    constructor();
    onAddedToEntity(entity: Entity): void;
    accept(data: CubeBodyData): boolean;
    isDirty(): boolean;
    read(data: CubeBodyData): void;
    write(): CubeBodyData;
    clone(): NetworkSphereBody$0;
}
declare module NetworkSphereBodyWrapper {
    export { NetworkSphereBody$0 as NetworkSphereBody };
}
import NetworkCubeBody = NetworkSphereBodyWrapper.NetworkSphereBody;
type ParticleOptions = {
    getDirection: () => Vec3;
    startScale: number;
    endScale: number;
    lifeTime: number;
    timeAlive: number;
    startColor: Vec3;
    endColor: Vec3;
};
declare class Particle extends Component {
    #private;
    constructor(options: ParticleOptions);
    get startColor(): Vec3;
    get endColor(): Vec3;
    get lifeTime(): number;
    set lifeTime(lifeTime: number);
    get timeAlive(): number;
    set timeAlive(timeAlive: number);
    get direction(): Vec3;
    get startScale(): number;
    get endScale(): number;
    clone(): Particle;
}
declare class ParticleEmitter extends Component {
    #private;
    constructor(particlePrefab: Entity, maxParticleCount: number, startParticleCount: number);
    get particlePrefab(): Entity;
    get maxParticleCount(): number;
    get startParticleCount(): number;
}
declare class ParticleSystem extends System<[
    Particle,
    Transform,
    ThreeObject3D
]> {
    constructor();
    onAddedToEcsManager(ecsManager: EcsManager): void;
    protected onLoop(components: [
        Particle,
        Transform,
        ThreeObject3D
    ][], entities: Entity[], deltaTime: number): void;
}
declare class Sound extends Component {
    #private;
    constructor(soundPath: string, repeat?: boolean, volume?: number, spacialized?: boolean);
    get spacialized(): boolean;
    get soundPath(): string;
    get sound(): HTMLAudioElement | undefined;
    set sound(sound: HTMLAudioElement | undefined);
    get repeat(): boolean;
}
declare class SoundSystem extends System<[
    Sound
]> {
    #private;
    constructor();
    start(ecsManager: EcsManager): Promise<void>;
    onEntityEligible(entity: Entity, components: [
        Sound
    ]): void;
    protected onLoop(components: [
        Sound
    ][], entities: Entity[], deltaTime: number): void;
}
export { Component, Entity, System, EcsManager, PrefabManager, SerializedEntity, SerializableComponent, IoUtils, ThreeCamera, ThreeObject3D, ThreeSystem, ThreeCameraSystem, ThreeAnimationSystem, ThreeAnimation, ThreeLightSystem, ThreeLightComponent, ThreeCss3dSystem, ThreeCss3dComponent, ThreeComponentDebugger, ThreeInstancedMesh, AnimatedState, AnimatedStateSystem, ServerNetworkSystem, ClientNetworkSystem, NetworkComponent, ClientHandler, ClientComponent, NetworkTransform, IsNetworked, NetworkAnimation, Transform, MathUtils, FiniteStateMachine, State, FiniteStateMachineSystem, StateSystem, NetworkFiniteStateMachine, TimedState, TimedStateSystem, Animation, IsPrefab, KeyboardInputSystem, MouseInputSystem, OimoComponent, OimoSystem, Body$0 as Body, SphereBody, PhysicsSystem, DefaultNarrowphase, Broadphase, BruteForceBroadphase, Collision, DefaultSolver, Ray, BodyDebugger, NetworkSphereBody, NetworkCubeBody, Particle, ParticleEmitter, ParticleSystem, Sound, SoundSystem };
export type { SerializedComponent, CustomData, NetworkScope };
