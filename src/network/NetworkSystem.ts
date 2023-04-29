import { Entity, System } from "../core";
import { SerializableComponent, SerializedEntity } from "../io";
import { ComponentClass } from "../core/Component";

/**
 * The networking system is responsible for sending and receiving entities over the networking.
 * This class is used by the server and the client to provide a common interface for formatting entities.
 */
export default class NetworkSystem extends System {
    public constructor(allowedNetworkComponents: ComponentClass[]) {
        super(allowedNetworkComponents);
    }

    protected onLoop(entities: Entity[], deltaTime: number): void {}

    public writeComponent(
        serializedEntity: SerializedEntity,
        serializableComponent: SerializableComponent<any>
    ) {
        serializedEntity.components.push(serializableComponent.serialize());
    }

    public readComponents(
        serializedEntity: SerializedEntity,
        targetEntity: Entity
    ) {
        serializedEntity.components.forEach((serializedComponent) => {
            const ComponentConstructor = this.filter.find(
                (ComponentClass) =>
                    ComponentClass.name === serializedComponent.className
            );

            if (!ComponentConstructor) {
                console.warn(
                    `Received unknown component from server ${serializedComponent.className}`
                );
                return;
            }

            let component = targetEntity.getComponent(ComponentConstructor);

            if (!component) {
                component = new ComponentConstructor();
                targetEntity.addComponent(component);
            }

            component.deserialize(serializedComponent);
        });
    }
}
