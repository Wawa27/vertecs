import { Vec3 } from "ts-gl-matrix";
import { Component } from "../core";
export type ParticleOptions = {
    getDirection: () => Vec3;
    startScale: number;
    endScale: number;
    lifeTime: number;
    timeAlive: number;
    startColor: Vec3;
    endColor: Vec3;
};
export default class Particle extends Component {
    #private;
    constructor(options: ParticleOptions);
    get startColor(): Vec3;
    get endColor(): Vec3;
    get lifeTime(): number;
    set lifeTime(lifeTime: number);
    get timeAlive(): number;
    set timeAlive(timeAlive: number);
    get direction(): Vec3;
    get startScale(): number;
    get endScale(): number;
    clone(): Particle;
}
