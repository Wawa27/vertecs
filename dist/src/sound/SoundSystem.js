import { System } from "../core";
import Sound from "./Sound";
export default class SoundSystem extends System {
    #audioContext;
    constructor() {
        super([Sound]);
    }
    async start(ecsManager) {
        this.#audioContext = new AudioContext();
    }
    onEntityEligible(entity, components) {
        const [sound] = components;
        sound.sound = new Audio(sound.soundPath);
        sound.sound.playbackRate = 1.2;
        sound.sound.volume = 0.4;
        sound.sound.play();
    }
    onLoop(components, entities, deltaTime) {
        for (let i = components.length - 1; i >= 0; i--) {
            const [sound] = components[i];
            if (sound.sound?.ended) {
                if (sound.repeat) {
                    sound.sound.play();
                }
                else {
                    entities[i].removeComponent(Sound);
                }
            }
        }
    }
}
