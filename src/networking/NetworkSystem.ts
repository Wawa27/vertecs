import { Entity, System } from "../core";
import { ComponentClass } from "../core/Component";
import SerializableComponent from "./SerializableComponent";
import { SerializedEntity } from "./SerializedEntity";

/**
 * The networking system is responsible for sending and receiving entities over the networking.
 * This class is used by the server and the client to provide a common interface for formatting entities.
 */
export default class NetworkSystem extends System {
    public static allowedNetworkComponents: ComponentClass[];

    public constructor(allowedComponents: ComponentClass[]) {
        super([]);

        NetworkSystem.allowedNetworkComponents = allowedComponents;
    }

    protected onLoop(entities: Entity[], deltaTime: number): void {}

    public static getComponentConstructor(
        componentClassName: string
    ): ComponentClass | undefined {
        return this.allowedNetworkComponents.find(
            (component) => component.name === componentClassName
        );
    }

    public writeComponent(
        serializedEntity: SerializedEntity,
        serializableComponent: SerializableComponent<any>
    ) {
        serializedEntity.components.push({
            data: serializableComponent.serialize(),
            id: serializableComponent.id,
            className: serializableComponent.constructor.name,
        });
    }

    public readComponents(
        serializedEntity: SerializedEntity,
        targetEntity: Entity
    ) {
        serializedEntity.components.forEach((serializedComponent) => {
            const ComponentConstructor = NetworkSystem.getComponentConstructor(
                serializedComponent.className
            ) as new () => SerializableComponent<any>;

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

            component.deserialize(serializedComponent.data);
        });
    }
}
