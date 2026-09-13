import { Component, Entity } from "../core";

export default class ParticleEmitterComponent extends Component {
    #particlePrefab: Entity;

    #maxParticleCount: number;

    #startParticleCount: number;

    #emissionSpeed: number;

    #emittedParticleCount: number;

    #emissionRadius: number;

    public constructor(
        particlePrefab: Entity,
        maxParticleCount: number,
        startParticleCount: number,
        emissionSpeed: number,
        emissionRadius: number
    ) {
        super();

        this.#particlePrefab = particlePrefab;
        this.#maxParticleCount = maxParticleCount;
        this.#startParticleCount = startParticleCount;
        this.#emissionSpeed = emissionSpeed;
        this.#emittedParticleCount = 0;
        this.#emissionRadius = emissionRadius;
    }

    public set emittedParticleCount(emittedParticleCount: number) {
        this.#emittedParticleCount = emittedParticleCount;
    }

    public get emittedParticleCount(): number {
        return this.#emittedParticleCount;
    }

    public get emissionRadius(): number {
        return this.#emissionRadius;
    }

    public get emissionSpeed(): number {
        return this.#emissionSpeed;
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
