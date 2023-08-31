import { Component } from "../core";
export default class ParticleEmitter extends Component {
    #particlePrefab;
    #maxParticleCount;
    #startParticleCount;
    constructor(particlePrefab, maxParticleCount, startParticleCount) {
        super();
        this.#particlePrefab = particlePrefab;
        this.#maxParticleCount = maxParticleCount;
        this.#startParticleCount = startParticleCount;
    }
    get particlePrefab() {
        return this.#particlePrefab;
    }
    get maxParticleCount() {
        return this.#maxParticleCount;
    }
    get startParticleCount() {
        return this.#startParticleCount;
    }
}
