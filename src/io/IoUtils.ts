import { Entity } from "../core";
import SerializedEntity from "./SerializedEntity";
import SerializableComponent from "./serializable.component";
import type {
    ComponentClass,
    ComponentClassConstructor,
} from "../core/Component";

export default class IoUtils {
    /**
     * Imports an entity from a json string
     * TODO: serializedEntityJson should be the parsed json
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

    public static importTree(
        ComponentClasses: ComponentClass[],
        serializedEntitiesJson: string[]
    ): Entity[] {
        const serializedEntities = serializedEntitiesJson.map(
            (json) =>
                JSON.parse(json, SerializedEntity.reviver) as SerializedEntity
        );

        const entities = serializedEntitiesJson.map((serializedEntity) =>
            this.import(ComponentClasses, serializedEntity)
        );

        const entitiesById = new Map(
            entities.map((entity) => [entity.id, entity])
        );

        serializedEntities.forEach((serializedEntity) => {
            if (serializedEntity.parentId) {
                const parentEntity = entitiesById.get(
                    serializedEntity.parentId
                );
                if (parentEntity) {
                    parentEntity.addChild(
                        entitiesById.get(serializedEntity.id)!
                    );
                }
            }
        });

        return entities;
    }

    /**
     * Exports an entity to a json string
     * @param entity
     */
    public static export(entity: Entity): string {
        const serializedEntity: SerializedEntity = new SerializedEntity(
            entity.id,
            new Map(),
            entity.name,
            entity.parent?.id
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

    public static exportTree(entity: Entity): string[] {
        return [
            this.export(entity),
            ...entity.children.flatMap((child) => this.exportTree(child)),
        ];
    }
}
