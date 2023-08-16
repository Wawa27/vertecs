import { Vec3 } from "ts-gl-matrix";
import { Component } from "../core";

export type ParticleOptions = {
    direction: Vec3;
    startScale: number;
    endScale: number;
    lifeTime: number;
    timeAlive: number;
    startColor: Vec3;
    endColor: Vec3;
};

export default class Particle extends Component {
    #startScale: number;

    #endScale: number;

    #direction: Vec3;

    #lifeTime: number;

    #timeAlive: number;

    #startColor: Vec3;

    #endColor: Vec3;

    public constructor(options: ParticleOptions) {
        super();

        this.#startScale = options.startScale;
        this.#endScale = options.endScale;
        this.#direction = options.direction;
        this.#lifeTime = options.lifeTime;
        this.#timeAlive = options.timeAlive;
        this.#startColor = options.startColor;
        this.#endColor = options.endColor;
    }

    public get startColor(): Vec3 {
        return this.#startColor;
    }

    public get endColor(): Vec3 {
        return this.#endColor;
    }

    public get lifeTime(): number {
        return this.#lifeTime;
    }

    public set lifeTime(lifeTime: number) {
        this.#lifeTime = lifeTime;
    }

    public get timeAlive(): number {
        return this.#timeAlive;
    }

    public set timeAlive(timeAlive: number) {
        this.#timeAlive = timeAlive;
    }

    public get direction(): Vec3 {
        return this.#direction;
    }

    public get startScale(): number {
        return this.#startScale;
    }

    public get endScale(): number {
        return this.#endScale;
    }

    public clone(): Particle {
        return new Particle({
            direction: new Vec3(
                Math.random() * 0.2,
                0.2 + Math.random(),
                Math.random() * 0.2
            ),
            startScale: Math.random() * 0.2,
            endScale: 0.2 + Math.random() * 0.8,
            lifeTime: Math.random() * 2 * 1000,
            timeAlive: 0,
            startColor: Vec3.clone(this.#startColor),
            endColor: Vec3.clone(this.#endColor),
        });
    }
}
