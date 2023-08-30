import { Component } from "../core";

export default class Sound extends Component {
    #sound?: HTMLAudioElement;

    #soundPath: string;

    #repeat: boolean;

    #spacialized: boolean;

    #volume: number;

    public constructor(
        soundPath: string,
        repeat: boolean = false,
        volume: number = 1,
        spacialized: boolean = false
    ) {
        super();
        this.#soundPath = soundPath;
        this.#repeat = repeat;
        this.#spacialized = spacialized;
        this.#volume = volume;
    }

    public get spacialized() {
        return this.#spacialized;
    }

    public get soundPath() {
        return this.#soundPath;
    }

    public get sound() {
        return this.#sound;
    }

    public set sound(sound: HTMLAudioElement | undefined) {
        this.#sound = sound;
    }

    public get repeat() {
        return this.#repeat;
    }
}
