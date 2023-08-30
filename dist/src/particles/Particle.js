import { Vec3 } from "ts-gl-matrix";
import { Component } from "../core";
export default class Particle extends Component {
    #startScale;
    #endScale;
    #direction;
    #lifeTime;
    #timeAlive;
    #startColor;
    #endColor;
    #getDirection;
    constructor(options) {
        super();
        this.#startScale = options.startScale;
        this.#endScale = options.endScale;
        this.#direction = options.getDirection();
        this.#lifeTime = options.lifeTime;
        this.#timeAlive = options.timeAlive;
        this.#startColor = options.startColor;
        this.#endColor = options.endColor;
        this.#getDirection = options.getDirection;
    }
    get startColor() {
        return this.#startColor;
    }
    get endColor() {
        return this.#endColor;
    }
    get lifeTime() {
        return this.#lifeTime;
    }
    set lifeTime(lifeTime) {
        this.#lifeTime = lifeTime;
    }
    get timeAlive() {
        return this.#timeAlive;
    }
    set timeAlive(timeAlive) {
        this.#timeAlive = timeAlive;
    }
    get direction() {
        return this.#direction;
    }
    get startScale() {
        return this.#startScale;
    }
    get endScale() {
        return this.#endScale;
    }
    clone() {
        return new Particle({
            getDirection: this.#getDirection,
            startScale: Math.random() * 0.1,
            endScale: 0.1 + Math.random() * 0.1,
            lifeTime: this.lifeTime,
            timeAlive: 0,
            startColor: new Vec3(this.startColor),
            endColor: new Vec3(this.endColor),
        });
    }
}
