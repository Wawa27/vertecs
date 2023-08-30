import { Component, Entity } from "../core";
export default class ParticleEmitter extends Component {
    #private;
    constructor(particlePrefab: Entity, maxParticleCount: number, startParticleCount: number);
    get particlePrefab(): Entity;
    get maxParticleCount(): number;
    get startParticleCount(): number;
}
