import { WebSocket } from "ws";
import { EcsManager, Entity } from "../../core";
import GameState from "../GameState";
import NetworkEntity from "../NetworkEntity";
import NetworkComponent, {
    SerializedNetworkComponent,
} from "../NetworkComponent";
import { ComponentClassConstructor } from "../../core/Component";
import ServerNetworkSystem from "./ServerNetworkSystem";
import IsPlayer from "../IsPlayer";
import IsNetworked from "../IsNetworked";

export default class ClientHandler {
    #serverNetworkSystem: ServerNetworkSystem;

    protected ecsManager: EcsManager;

    protected $webSocket: WebSocket;

    readonly $clientEntity: Entity;

    #clientSnapshot?: GameState;

    #serverSnapshot: GameState;

    #forceUpdate: boolean;

    public constructor(
        ecsManager: EcsManager,
        webSocket: WebSocket,
        serverNetworkSystem: ServerNetworkSystem
    ) {
        this.ecsManager = ecsManager;
        this.$webSocket = webSocket;
        this.#forceUpdate = true;
        this.$webSocket.on("message", (data: any) => {
            this.#clientSnapshot = JSON.parse(
                data.toString(),
                GameState.reviver
            );
        });
        this.#forceUpdate = true;
        this.#clientSnapshot = new GameState();
        this.#serverSnapshot = new GameState();
        this.#serverNetworkSystem = serverNetworkSystem;

        this.$clientEntity = this.ecsManager!.createEntity();
        this.$clientEntity.name = `client-entity-${this.$clientEntity.id}`;
        this.$clientEntity.addComponent(new IsPlayer());
        this.$clientEntity.addComponent(new IsNetworked(this.$clientEntity.id));
    }

    public onConnect(): void {
        this.#serverNetworkSystem.gameState.entities.forEach((entity) => {
            this.#serverSnapshot.entities.set(entity.id, entity);
        });
    }

    public onDisconnect(): void {
        this.$clientEntity.destroy();
    }

    public sendEntity(networkEntity: NetworkEntity): void {
        this.#serverSnapshot?.entities.set(networkEntity.id, networkEntity);
    }

    public updateClient(): void {
        const snapshot = JSON.stringify(this.#serverSnapshot);
        if (this.#forceUpdate) {
            // TODO: send whole server state
            this.webSocket.send(snapshot);
        } else if (
            this.#serverSnapshot.customData.length > 0 ||
            this.#serverSnapshot.entities.size > 0
        ) {
            this.webSocket.send(snapshot);
        }

        this.#forceUpdate = false;
        this.#serverSnapshot = new GameState();
    }

    public processClientSnapshot(): void {
        if (!this.#clientSnapshot) {
            return;
        }

        this.#clientSnapshot.entities.forEach((serializedEntity) => {
            this.deserializeEntity(serializedEntity);
        });
        this.#clientSnapshot.customData.forEach((data) => {
            this.onPrivateCustomData(data);
        });

        this.#clientSnapshot = undefined;
    }

    private deserializeEntity(serializedEntity: NetworkEntity) {
        const targetEntity = this.ecsManager?.entities.find(
            (entity) => entity.id === serializedEntity.id
        );

        if (!targetEntity) {
            console.warn(
                `Received entity with id ${serializedEntity.id} but it doesn't exist`
            );
            return;
        }

        serializedEntity.components.forEach((networkComponent) => {
            this.deserializeComponent(networkComponent, targetEntity);
        });
    }

    private deserializeComponent(
        serializedNetworkComponent: SerializedNetworkComponent<any>,
        targetEntity: Entity
    ) {
        const ComponentConstructor =
            this.#serverNetworkSystem.$allowedNetworkComponents.find(
                (ComponentClass) =>
                    ComponentClass.name === serializedNetworkComponent.className
            ) as ComponentClassConstructor;

        if (!ComponentConstructor) {
            console.warn(
                `Received unknown component from server ${JSON.stringify(
                    serializedNetworkComponent
                )}`
            );
            return;
        }

        let component = targetEntity.getComponent(
            ComponentConstructor
        ) as NetworkComponent<any>;

        if (!component) {
            component = new ComponentConstructor();
            targetEntity.addComponent(component);
        }

        if (
            serializedNetworkComponent.updateTimestamp > 0 &&
            component.updateTimestamp
        ) {
            // If the component is older than the last update, ignore it
            // Clients should check if the server component match with the old state of the entity
            // If it doesn't match, the client should roll back the entity to this state
            if (
                component.updateTimestamp >=
                serializedNetworkComponent.updateTimestamp
            ) {
                // this.isOutOfSync(
                //     this.#previousSnapshots[0],
                //     serializedEntity,
                //     networkComponent
                // );
                return;
            }
        }

        component.forceUpdate = true;
        component.updateTimestamp = serializedNetworkComponent.updateTimestamp;
        component.deserialize(serializedNetworkComponent);
    }

    public sendCustomData(data: any): void {
        this.#serverSnapshot.customData.push(data);
    }

    public onPrivateCustomData(data: any): void {}

    public get webSocket(): WebSocket {
        return this.$webSocket;
    }

    public get forceUpdate(): boolean {
        return this.#forceUpdate;
    }

    public set forceUpdate(forceUpdate: boolean) {
        this.#forceUpdate = forceUpdate;
    }

    public get clientEntity(): Entity {
        return this.$clientEntity;
    }
}
