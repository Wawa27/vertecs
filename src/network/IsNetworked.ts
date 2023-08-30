import NetworkComponent from "./NetworkComponent";
import { Entity } from "../core";

type NetworkData = {
    parent: string;
};

export type NetworkScope = "public" | "private";

/**
 * This component is used to mark an entity as networked, it is used by the network systems to determine which entities to send to which clients.
 */
export default class IsNetworked extends NetworkComponent<NetworkData> {
    #parent?: Entity;

    public constructor(ownerId?: string, scope?: NetworkScope) {
        super(ownerId, scope);
    }

    public accept(data: NetworkData): boolean {
        return false;
    }

    public read(data: NetworkData) {
        if (this.#parent?.id !== data.parent && this.entity?.ecsManager) {
            const parentEntity = this.entity.ecsManager.entities.find(
                (entity) => entity.id === data.parent
            );
            if (parentEntity) {
                parentEntity.addChild(this.entity);
            }
        }

        this.#parent = this.entity?.parent;
    }

    public write(): NetworkData {
        this.#parent = this.entity?.parent;
        return {
            parent: this.#parent?.id ?? "*",
        };
    }

    public isDirty(): boolean {
        return false;
    }
}
