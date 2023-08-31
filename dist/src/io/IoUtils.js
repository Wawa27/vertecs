import { Entity } from "../core";
import SerializedEntity from "./SerializedEntity";
import SerializableComponent from "./SerializableComponent";
export default class IoUtils {
    /**
     * Imports an entity from a json string
     * @param ComponentClasses The list of component classes to import
     * @param serializedEntityJson
     */
    static import(ComponentClasses, serializedEntityJson) {
        const serializedEntity = JSON.parse(serializedEntityJson, SerializedEntity.reviver);
        const targetEntity = new Entity({
            id: serializedEntity.id,
            name: serializedEntity.name,
        });
        serializedEntity.components.forEach((serializedComponent) => {
            const TargetComponentClass = ComponentClasses.find((ComponentClass) => ComponentClass.name === serializedComponent.className);
            if (!TargetComponentClass) {
                console.warn(`Unknown component found in import ${serializedComponent.className}`);
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
    static export(entity) {
        const serializedEntity = new SerializedEntity(entity.id, new Map(), entity.name);
        entity.components.forEach((component) => {
            if (component instanceof SerializableComponent) {
                serializedEntity.components.set(component.constructor.name, component.serialize(false));
            }
        });
        return JSON.stringify(serializedEntity);
    }
}
