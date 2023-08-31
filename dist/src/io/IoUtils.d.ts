import { Entity } from "../core";
import type { ComponentClass } from "../core/Component";
export default class IoUtils {
    /**
     * Imports an entity from a json string
     * @param ComponentClasses The list of component classes to import
     * @param serializedEntityJson
     */
    static import(ComponentClasses: ComponentClass[], serializedEntityJson: string): Entity;
    /**
     * Exports an entity to a json string
     * @param entity
     */
    static export(entity: Entity): string;
}
