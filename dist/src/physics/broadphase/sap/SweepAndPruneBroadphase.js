import Broadphase from "../Broadphase";
import Body from "../../bodies/Body";
import Endpoint from "./Endpoint";
export default class SweepAndPruneBroadphase extends Broadphase {
    #potentialCollisionPairs;
    #endpoints;
    constructor() {
        super();
        // X, Y, Z axes
        this.#endpoints = [[], [], []];
        this.#potentialCollisionPairs = [];
    }
    onEntityAdded(entity) {
        const body = entity.getComponent(Body);
        if (!body) {
            throw new Error("Entity must have a Body component");
        }
        for (let i = 0; i < this.#endpoints.length; i++) {
            this.#endpoints[i].push(new Endpoint(body.getBoundingBox().minimum[i], true, entity), new Endpoint(body.getBoundingBox().maximum[i], false, entity));
        }
    }
    onEntityRemoved(entity) {
        this.#endpoints.forEach((axis) => {
            // Find the indices of the entity's endpoints
            const minIndex = axis.findIndex((endpoint) => endpoint.entity === entity && endpoint.isMinimum);
            const maxIndex = axis.findIndex((endpoint) => endpoint.entity === entity && !endpoint.isMinimum);
            // Remove the endpoints by splicing them out of the array
            if (minIndex !== -1)
                axis.splice(minIndex, 1);
            if (maxIndex !== -1)
                axis.splice(maxIndex, 1);
        });
        this.updateCollisionPairs();
    }
    onEntityMoved(entity) {
        const body = entity.getComponent(Body);
        if (!body) {
            throw new Error("Entity must have a Body component");
        }
        this.#endpoints.forEach((axis, index) => {
            const minEndpoint = axis.find((endpoint) => endpoint.entity === entity && endpoint.isMinimum);
            const maxEndpoint = axis.find((endpoint) => endpoint.entity === entity && !endpoint.isMinimum);
            if (minEndpoint)
                minEndpoint.value = body.getBoundingBox().minimum[index];
            if (maxEndpoint)
                maxEndpoint.value = body.getBoundingBox().maximum[index];
        });
        this.updateCollisionPairs();
    }
    getCollisionPairs(entities) {
        return this.#potentialCollisionPairs;
    }
    updateCollisionPairs() {
        this.sortEndpoints();
        this.#potentialCollisionPairs.length = 0;
        this.#endpoints.forEach((axis) => {
            const activeList = [];
            axis.forEach((endpoint) => {
                if (endpoint.isMinimum) {
                    for (let i = 0; i < activeList.length; i++) {
                        const active = activeList[i];
                        const pair = [
                            active,
                            endpoint.entity,
                        ].sort();
                        // Check if the pair already exists in the potential collisions
                        if (!this.#potentialCollisionPairs.some((collision) => collision[0] === pair[0] &&
                            collision[1] === pair[1])) {
                            this.#potentialCollisionPairs.push(pair);
                        }
                    }
                    activeList.push(endpoint.entity);
                }
                else {
                    const index = activeList.indexOf(endpoint.entity);
                    if (index !== -1) {
                        activeList.splice(index, 1);
                    }
                }
            });
        });
    }
    sortEndpoints() {
        this.#endpoints.forEach((axis) => {
            axis.sort((a, b) => a.value - b.value ||
                Number(b.isMinimum) - Number(a.isMinimum));
        });
    }
}
