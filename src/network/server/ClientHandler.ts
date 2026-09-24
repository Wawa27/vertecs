import { WebSocket } from "ws";
import { EcsManager, Entity } from "../../core";
import NetworkSnapshot from "../NetworkSnapshot";
import NetworkEntity from "../NetworkEntity";
import NetworkComponent, {
    SerializedNetworkComponent,
} from "../network.component";
import { ComponentClassConstructor } from "../../core/Component";
import ServerNetworkSystem from "./ServerNetworkSystem";
import IsPlayer from "../IsPlayer";
import IsNetworked from "../is-networked.component";
import type Command from "../commands/Command";

export default class ClientHandler {
    #serverNetworkSystem: ServerNetworkSystem;

    protected ecsManager: EcsManager;

    protected $webSocket: WebSocket;

    readonly $clientEntity: Entity;

    #clientSnapshot?: NetworkSnapshot;

    #serverSnapshot: NetworkSnapshot;

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
                NetworkSnapshot.reviver
            );
        });
        this.#forceUpdate = true;
        this.#clientSnapshot = new NetworkSnapshot();
        this.#serverSnapshot = new NetworkSnapshot();
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
            this.#serverSnapshot.commands.length > 0 ||
            this.#serverSnapshot.entities.size > 0
        ) {
            this.webSocket.send(snapshot);
        }

        this.#forceUpdate = false;
        this.#serverSnapshot = new NetworkSnapshot();
    }

    public processClientSnapshot(): void {
        if (!this.#clientSnapshot) {
            return;
        }

        this.#clientSnapshot.entities.forEach((serializedEntity) => {
            this.deserializeEntity(serializedEntity);
        });
        this.#clientSnapshot.commands.forEach((serializedCommand) => {
            this.#serverNetworkSystem.onCommand(serializedCommand, this);
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

        // Server-side authority: reject client updates the component does not
        // accept. accept() may also clamp the data in place (e.g.
        // AuthoritativeNetworkTransform) before it is applied.
        const { data } = serializedNetworkComponent;
        if (!component.accept(data)) {
            return;
        }

        component.updateTimestamp = serializedNetworkComponent.updateTimestamp;
        component.deserialize(serializedNetworkComponent);
    }

    public sendCommand(command: Command): void {
        this.#serverSnapshot.commands.push(command.serialize());
    }

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
