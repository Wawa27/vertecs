import { Component } from "../core";
export default class Sound extends Component {
    #private;
    constructor(soundPath: string, repeat?: boolean, volume?: number, spacialized?: boolean);
    get spacialized(): boolean;
    get soundPath(): string;
    get sound(): HTMLAudioElement | undefined;
    set sound(sound: HTMLAudioElement | undefined);
    get repeat(): boolean;
}
