import { Component } from "../core";
export default class Sound extends Component {
    #sound;
    #soundPath;
    #repeat;
    #spacialized;
    #volume;
    constructor(soundPath, repeat = false, volume = 1, spacialized = false) {
        super();
        this.#soundPath = soundPath;
        this.#repeat = repeat;
        this.#spacialized = spacialized;
        this.#volume = volume;
    }
    get spacialized() {
        return this.#spacialized;
    }
    get soundPath() {
        return this.#soundPath;
    }
    get sound() {
        return this.#sound;
    }
    set sound(sound) {
        this.#sound = sound;
    }
    get repeat() {
        return this.#repeat;
    }
}
