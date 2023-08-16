import { Component, Entity } from "../core";

export default class ParticleEmitter extends Component {
    #particlePrefab: Entity;

    #maxParticleCount: number;

    #startParticleCount: number;

    public constructor(
        particlePrefab: Entity,
        maxParticleCount: number,
        startParticleCount: number
    ) {
        super();

        this.#particlePrefab = particlePrefab;
        this.#maxParticleCount = maxParticleCount;
        this.#startParticleCount = startParticleCount;
    }

    public get particlePrefab(): Entity {
        return this.#particlePrefab;
    }

    public get maxParticleCount(): number {
        return this.#maxParticleCount;
    }

    public get startParticleCount(): number {
        return this.#startParticleCount;
    }
}
