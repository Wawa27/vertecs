import { EcsManager, Entity, System } from "../core";
import Sound from "./Sound";

export default class SoundSystem extends System<[Sound]> {
    #audioContext?: AudioContext;

    public constructor() {
        super([Sound]);
    }

    public async start(ecsManager: EcsManager): Promise<void> {
        this.#audioContext = new AudioContext();
    }

    public onEntityEligible(entity: Entity, components: [Sound]) {
        const [sound] = components;

        sound.sound = new Audio(sound.soundPath);

        sound.sound.playbackRate = 1.2;
        sound.sound.volume = 0.4;

        sound.sound.play();
    }

    protected onLoop(
        components: [Sound][],
        entities: Entity[],
        deltaTime: number
    ) {
        for (let i = components.length - 1; i >= 0; i--) {
            const [sound] = components[i];
            if (sound.sound?.ended) {
                if (sound.repeat) {
                    sound.sound.play();
                } else {
                    entities[i].removeComponent(Sound);
                }
            }
        }
    }
}
