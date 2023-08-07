import { Entity } from "../core";
import SerializedEntity from "./SerializedEntity";
import SerializableComponent from "./SerializableComponent";
import type {
    ComponentClass,
    ComponentClassConstructor,
} from "../core/Component";
import { State } from "../utils";

export default class IoUtils {
    /**
     * Imports an entity from a json string
     * @param ComponentClasses The list of component classes to import
     * @param serializedEntityJson
     */
    public static import(
        ComponentClasses: ComponentClass[],
        serializedEntityJson: string
    ): Entity {
        const serializedEntity: SerializedEntity = JSON.parse(
            serializedEntityJson,
            SerializedEntity.reviver
        );
        const targetEntity: Entity = new Entity({
            id: serializedEntity.id,
            name: serializedEntity.name,
        });

        serializedEntity.components.forEach((serializedComponent) => {
            const TargetComponentClass = ComponentClasses.find(
                (ComponentClass) =>
                    ComponentClass.name === serializedComponent.className
            ) as ComponentClassConstructor;

            if (!TargetComponentClass) {
                console.warn(
                    `Unknown component found in import ${serializedComponent.className}`
                );
                return;
            }

            const component = new TargetComponentClass();
            targetEntity.addComponent(component);
            component.deserialize(serializedComponent);
        });

        return targetEntity;
    }

    /**
     * Exports an entity to a json string
     * @param entity
     */
    public static export(entity: Entity): string {
        const serializedEntity: SerializedEntity = new SerializedEntity(
            entity.id,
            new Map(),
            entity.name
        );
        entity.components.forEach((component) => {
            if (component instanceof SerializableComponent) {
                serializedEntity.components.set(
                    component.constructor.name,
                    component.serialize(false)
                );
            }
        });
        return JSON.stringify(serializedEntity);
    }
}
