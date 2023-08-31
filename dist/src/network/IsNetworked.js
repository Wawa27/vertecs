import NetworkComponent from "./NetworkComponent";
/**
 * This component is used to mark an entity as networked, it is used by the network systems to determine which entities to send to which clients.
 */
export default class IsNetworked extends NetworkComponent {
    #parent;
    constructor(ownerId, scope) {
        super(ownerId, scope);
    }
    accept(data) {
        return false;
    }
    read(data) {
        if (this.#parent?.id !== data.parent && this.entity?.ecsManager) {
            const parentEntity = this.entity.ecsManager.entities.find((entity) => entity.id === data.parent);
            if (parentEntity) {
                parentEntity.addChild(this.entity);
            }
        }
        this.#parent = this.entity?.parent;
    }
    write() {
        this.#parent = this.entity?.parent;
        return {
            parent: this.#parent?.id ?? "*",
        };
    }
    isDirty() {
        return false;
    }
}
