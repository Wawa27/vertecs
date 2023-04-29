import { EcsManager, Entity } from "../core";
import SerializedEntity from "./SerializedEntity";
import SerializableComponent from "./SerializableComponent";
import { ComponentClass } from "../core/Component";

export default class IoUtils {
    /**
     * Imports an entity from a json string
     * @param ecsManager
     * @param ComponentClasses The list of component classes to import
     * @param json
     */
    public static import(
        ecsManager: EcsManager,
        ComponentClasses: ComponentClass[],
        json: string
    ): Entity {
        const serializedEntity: SerializedEntity = JSON.parse(json);
        const targetEntity: Entity =
            Entity.findById(ecsManager, serializedEntity.id) ??
            ecsManager.newEntity({ id: serializedEntity.id });

        serializedEntity.components.forEach((serializedComponent) => {
            const TargetComponentClass = ComponentClasses.find(
                (ComponentClass) =>
                    ComponentClass.name === serializedComponent.className
            );

            if (!TargetComponentClass) {
                console.warn(
                    `Unknown component found in import ${serializedComponent.className}`
                );
                return;
            }

            const component = new TargetComponentClass();
            component.deserialize(serializedComponent);

            targetEntity.addComponent(component);
        });

        return targetEntity;
    }

    /**
     * Exports an entity to a json string
     * @param entity
     */
    public static export(entity: Entity): string {
        const serializedEntity: SerializedEntity = {
            id: entity.id,
            components: [],
        };
        entity.components.forEach((component) => {
            if (component instanceof SerializableComponent) {
                serializedEntity.components.push(component.serialize());
            }
        });
        return JSON.stringify(serializedEntity);
    }
}
