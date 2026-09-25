import { WebSocket } from "ws";
import { EcsManager, Entity } from "../../core";
import NetworkSnapshot from "../NetworkSnapshot";
import SerializedNetworkEntity from "../SerializedNetworkEntity";
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

    #clientSnapshots: NetworkSnapshot[];

    #stagingSnapshot: NetworkSnapshot;

    readonly #sentHistory: Map<number, string>;

    #nextServerRevision: number;

    #lastAckedServerRevision: number;

    #lastProcessedClientRevision: number;

    #clientAcknowledgementPending: boolean;

    #forceUpdate: boolean;

    public constructor(
        ecsManager: EcsManager,
        webSocket: WebSocket,
        serverNetworkSystem: ServerNetworkSystem
    ) {
        this.ecsManager = ecsManager;
        this.$webSocket = webSocket;
        this.#clientSnapshots = [];
        this.$webSocket.on("message", (data: any) => {
            this.#clientSnapshots.push(
                JSON.parse(data.toString(), NetworkSnapshot.reviver)
            );
        });
        this.#forceUpdate = true;
        this.#stagingSnapshot = new NetworkSnapshot();
        this.#sentHistory = new Map();
        this.#nextServerRevision = 1;
        this.#lastAckedServerRevision = 0;
        this.#lastProcessedClientRevision = 0;
        this.#clientAcknowledgementPending = false;
        this.#serverNetworkSystem = serverNetworkSystem;

        this.$clientEntity = this.ecsManager!.createEntity();
        this.$clientEntity.name = `client-entity-${this.$clientEntity.id}`;
        this.$clientEntity.addComponent(new IsPlayer());
        this.$clientEntity.addComponent(new IsNetworked(this.$clientEntity.id));
    }

    public onConnect(): void {
        this.#serverNetworkSystem.gameState.entities.forEach((entity) => {
            this.sendEntity(entity);
        });
    }

    public onDisconnect(): void {
        this.$clientEntity.destroy();
    }

    public sendEntity(serializedNetworkEntity: SerializedNetworkEntity): void {
        const pendingEntity = this.#stagingSnapshot.entities.get(
            serializedNetworkEntity.id
        );

        if (!pendingEntity || serializedNetworkEntity.isDestroyed) {
            this.#stagingSnapshot.entities.set(
                serializedNetworkEntity.id,
                serializedNetworkEntity
            );
            return;
        }

        serializedNetworkEntity.components.forEach(
            (serializedNetworkComponent, className) => {
                pendingEntity.components.set(
                    className,
                    serializedNetworkComponent
                );
            }
        );
    }

    public updateClient(): void {
        if (
            this.#forceUpdate ||
            this.#stagingSnapshot.commands.length > 0 ||
            this.#stagingSnapshot.entities.size > 0 ||
            this.#clientAcknowledgementPending
        ) {
            this.#stagingSnapshot.revision = this.#nextServerRevision;
            this.#stagingSnapshot.ackRevision =
                this.#lastProcessedClientRevision;
            this.#stagingSnapshot.timestamp = Date.now();
            this.#sentHistory.set(
                this.#nextServerRevision,
                JSON.stringify(this.#stagingSnapshot)
            );
            this.#nextServerRevision += 1;
            this.#stagingSnapshot = new NetworkSnapshot();
            this.#clientAcknowledgementPending = false;
        }

        this.#forceUpdate = false;
        this.#sentHistory.forEach((snapshot) => {
            this.webSocket.send(snapshot);
        });
    }

    public processClientSnapshot(): void {
        const snapshots = this.#clientSnapshots;
        this.#clientSnapshots = [];

        snapshots.forEach((snapshot) => {
            this.#acknowledge(snapshot.ackRevision ?? 0);

            const hasClientPayload =
                snapshot.entities.size > 0 || snapshot.commands.length > 0;
            if (!hasClientPayload) {
                return;
            }

            if (
                !Number.isSafeInteger(snapshot.revision) ||
                snapshot.revision !== this.#lastProcessedClientRevision + 1
            ) {
                return;
            }

            snapshot.entities.forEach((serializedEntity) => {
                this.deserializeEntity(serializedEntity);
            });
            snapshot.commands.forEach((serializedCommand) => {
                this.#serverNetworkSystem.onCommand(serializedCommand, this);
            });
            this.#lastProcessedClientRevision = snapshot.revision;
            this.#clientAcknowledgementPending = true;
        });
    }

    #acknowledge(revision: number): void {
        if (!Number.isSafeInteger(revision) || revision < 1) {
            return;
        }

        const highestSentRevision = this.#nextServerRevision - 1;
        const acknowledgedRevision = Math.min(revision, highestSentRevision);

        if (acknowledgedRevision <= this.#lastAckedServerRevision) {
            return;
        }

        for (
            let sentRevision = this.#lastAckedServerRevision + 1;
            sentRevision <= acknowledgedRevision;
            sentRevision += 1
        ) {
            this.#sentHistory.delete(sentRevision);
        }
        this.#lastAckedServerRevision = acknowledgedRevision;
    }

    private deserializeEntity(serializedEntity: SerializedNetworkEntity) {
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

        // Server-side authority: reject client updates the component does not
        // accept before applying the revisioned client state.
        const { data } = serializedNetworkComponent;
        if (!component.accept(data)) {
            component.requestNetworkUpdate();
            return;
        }

        component.updateTimestamp = serializedNetworkComponent.updateTimestamp;
        component.deserialize(serializedNetworkComponent);
    }

    public sendCommand(command: Command): void {
        this.#stagingSnapshot.commands.push(command.serialize());
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

    public get lastProcessedClientRevision(): number {
        return this.#lastProcessedClientRevision;
    }
}
