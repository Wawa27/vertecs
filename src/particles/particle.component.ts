import { Vec3 } from "ts-gl-matrix";
import { Component } from "../core";

export type ParticleOptions = {
    getDirection: () => Vec3;
    startScale: number;
    endScale: number;
    lifeTime: number;
    timeAlive: number;
    colors: Vec3[];
};

export default class ParticleComponent extends Component {
    #startScale: number;

    #endScale: number;

    #direction: Vec3;

    #lifeTime: number;

    #timeAlive: number;

    #colors: Vec3[];

    readonly #getDirection: () => Vec3;

    public constructor(options: ParticleOptions) {
        super();

        this.#startScale = options.startScale;
        this.#endScale = options.endScale;
        this.#direction = options.getDirection();
        this.#lifeTime = options.lifeTime;
        this.#timeAlive = options.timeAlive;
        this.#colors = options.colors;
        this.#getDirection = options.getDirection;
    }

    public get colors(): Vec3[] {
        return this.#colors;
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

    public clone(): ParticleComponent {
        return new ParticleComponent({
            getDirection: this.#getDirection,
            startScale: this.#startScale,
            endScale: this.#endScale,
            lifeTime: this.lifeTime,
            timeAlive: 0,
            colors: this.#colors
        });
    }
}
