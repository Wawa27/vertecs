import NetworkComponent from "./NetworkComponent";
import { Component, Entity } from "../core";

export type NetworkScope = "public" | "private";

type NetworkData = {
    parentId: string;
};

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
        if (this.#parent?.id !== data.parentId && this.entity?.ecsManager) {
            const parentEntity = this.entity.ecsManager.entities.find(
                (entity) => entity.id === data.parentId
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
            parentId: this.#parent?.id ?? "*",
        };
    }

    public isDirty(lastSnapshot: NetworkData): boolean {
        return (this.#parent?.id ?? "*") !== lastSnapshot.parentId;
    }

    public clone(): Component {
        return new IsNetworked();
    }
}
