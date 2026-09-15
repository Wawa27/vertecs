import { WebSocket } from "ws";
import { EcsManager, Entity } from "../../core";
import type { ComponentClass } from "../../core/Component";
import IsNetworked from "../is-networked.component";
import CommandRegistry from "../commands/CommandRegistry";
import ServerNetworkSystem from "./ServerNetworkSystem";
import AoiClientHandler from "./AoiClientHandler";

type AoiClientHandlerConstructor = new (
    ecsManager: EcsManager,
    webSocket: WebSocket,
    serverNetworkSystem: ServerNetworkSystem
) => AoiClientHandler;

/**
 * A {@link ServerNetworkSystem} variant that only sends each client the
 * entities within its area of interest instead of the whole world.
 *
 * Subclasses override {@link getRelevantEntityIdsForClient} to decide which
 * entity ids each client should receive. Entities entering a client's AOI are
 * sent in full (so the client can spawn them); entities leaving it are marked
 * destroyed.
 */
export default class AoiServerNetworkSystem extends ServerNetworkSystem {
    public constructor(
        allowedNetworkComponents: ComponentClass[],
        clientHandlerConstructor: AoiClientHandlerConstructor,
        commandRegistry?: CommandRegistry,
        tps?: number,
        port?: number
    ) {
        super(
            allowedNetworkComponents,
            clientHandlerConstructor,
            commandRegistry,
            tps,
            port
        );
    }

    /**
     * Returns the entity ids a given client should currently receive.
     * Default: every networked entity (no AOI filtering). Override to cull.
     */
    protected getRelevantEntityIdsForClient(
        clientHandler: AoiClientHandler,
        entities: Entity[]
    ): Set<string> {
        return new Set(entities.map((entity) => entity.id));
    }

    public override onEntityEligible(
        entity: Entity,
        components: [IsNetworked]
    ) {
        // New networked entities start forceUpdate on all components, so they
        // serialize fully on the first loop. Store them immediately in the
        // game state so they can be sent in full to clients entering their AOI.
        if (!this.gameState.entities.has(entity.id)) {
            const serializedEntity = this.serializeEntity(entity);
            if (serializedEntity) {
                this.gameState.entities.set(
                    serializedEntity.id,
                    serializedEntity
                );
            }
        }
    }

    public override onEntityNoLongerEligible(
        entity: Entity,
        components: [IsNetworked]
    ) {
        const networkEntity = this.gameState.entities.get(entity.id);

        if (networkEntity) {
            networkEntity.isDestroyed = true;
            this.$clientHandlers.forEach((clientHandler) => {
                const aoiClientHandler = clientHandler as AoiClientHandler;
                if (aoiClientHandler.isEntityRelevant(entity.id)) {
                    aoiClientHandler.sendEntity(networkEntity);
                }
            });
        }
    }

    protected override onLoop(
        components: [IsNetworked][],
        entities: Entity[],
        deltaTime: number
    ): void {
        // Process clients entities
        this.$clientHandlers.forEach((clientHandler) => {
            clientHandler.processClientSnapshot();
        });

        // Update each client's area of interest. Entities leaving the client's
        // relevance set are marked destroyed.
        const enteredByClient = new Map<AoiClientHandler, string[]>();
        this.$clientHandlers.forEach((clientHandler) => {
            const aoiClientHandler = clientHandler as AoiClientHandler;
            const relevantIds = this.getRelevantEntityIdsForClient(
                aoiClientHandler,
                entities
            );
            enteredByClient.set(
                aoiClientHandler,
                aoiClientHandler.updateRelevance(relevantIds)
            );
        });

        // Add latest destroyed entities to the delta game state
        this.gameState.entities.forEach((networkEntity) => {
            if (networkEntity.isDestroyed) {
                this.$clientHandlers.forEach((clientHandler) => {
                    const aoiClientHandler = clientHandler as AoiClientHandler;
                    if (aoiClientHandler.isEntityRelevant(networkEntity.id)) {
                        aoiClientHandler.sendEntity(networkEntity);
                    }
                });
                this.gameState.entities.delete(networkEntity.id);
            }
        });

        entities.forEach((entity) => {
            const serializedEntity = this.serializeEntity(entity);

            if (serializedEntity) {
                this.$clientHandlers.forEach((clientHandler) => {
                    const aoiClientHandler = clientHandler as AoiClientHandler;
                    if (aoiClientHandler.isEntityRelevant(entity.id)) {
                        aoiClientHandler.sendEntity(serializedEntity);
                    }
                });

                // Update game state
                const currentSnapshotEntity = this.gameState.entities.get(
                    serializedEntity.id
                );
                if (!currentSnapshotEntity) {
                    this.gameState.entities.set(
                        serializedEntity.id,
                        serializedEntity
                    );
                } else {
                    serializedEntity.components.forEach((networkComponent) => {
                        currentSnapshotEntity.components.set(
                            networkComponent.className,
                            networkComponent
                        );
                    });
                }
            }
        });

        // Send full state for entities that just entered a client's AOI, so
        // the client can spawn them.
        enteredByClient.forEach((enteredIds, aoiClientHandler) => {
            enteredIds.forEach((entityId) => {
                const fullEntity = this.gameState.entities.get(entityId);
                if (fullEntity) {
                    aoiClientHandler.sendEntity(fullEntity);
                }
            });
        });

        this.$clientHandlers.forEach((clientHandler) => {
            clientHandler.updateClient();
        });
    }
}
