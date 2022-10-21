import SerializedComponent from "./SerializedComponent";
import SerializableComponent from "./SerializableComponent";
import { Entity } from "../core";
import NetworkSystem from "./NetworkSystem";

/**
 * The json representation of an entity that can be sent over the network
 */
export default class SerializedEntity {
    #owner?: string;

    #id: string;

    #components: SerializedComponent<any>[];

    public constructor(
        id: string,
        components: SerializedComponent<any>[],
        owner?: string
    ) {
        this.#id = id;
        this.#components = components;
        this.#owner = owner;
    }

    public writeComponent(serializableComponent: SerializableComponent<any>) {
        this.#components.push(
            new SerializedComponent<any>(
                serializableComponent.serialize(),
                serializableComponent.id,
                serializableComponent.constructor.name
            )
        );
    }

    public readComponents(targetEntity: Entity) {
        this.components.forEach((serializedComponent) => {
            const ComponentConstructor = NetworkSystem.getComponentConstructor(
                serializedComponent.componentClassName
            ) as new () => SerializableComponent<any>;

            if (!ComponentConstructor) {
                console.warn(
                    `Received unknown component from server ${serializedComponent.componentClassName}`
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

    public get id(): string {
        return this.#id;
    }

    public set id(value: string) {
        this.#id = value;
    }

    public get components(): SerializedComponent<any>[] {
        return this.#components;
    }

    public set components(value: SerializedComponent<any>[]) {
        this.#components = value;
    }
}
