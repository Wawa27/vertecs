import { Entity, System } from "../core";
import { ComponentClass } from "../core/Component";

export default class NetworkSystem extends System {
    static #allowedComponents: ComponentClass[];

    public constructor(allowedComponents: ComponentClass[]) {
        super([]);

        NetworkSystem.#allowedComponents = allowedComponents;
    }

    protected onLoop(entities: Entity[], deltaTime: number): void {}

    public static getComponentConstructor(
        componentClassName: string
    ): ComponentClass | undefined {
        return this.#allowedComponents.find(
            (component) => component.name === componentClassName
        );
    }
}
