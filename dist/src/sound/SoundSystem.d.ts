import { EcsManager, Entity, System } from "../core";
import Sound from "./Sound";
export default class SoundSystem extends System<[Sound]> {
    #private;
    constructor();
    start(ecsManager: EcsManager): Promise<void>;
    onEntityEligible(entity: Entity, components: [Sound]): void;
    protected onLoop(components: [Sound][], entities: Entity[], deltaTime: number): void;
}
