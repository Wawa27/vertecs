import { NetworkComponent } from "../../network";
import CubeBody from "../bodies/CubeBody";
export default class NetworkSphereBody extends NetworkComponent {
    constructor() {
        super();
    }
    onAddedToEntity(entity) {
        const cubeBody = entity.getComponent(CubeBody);
        if (!cubeBody) {
            entity.addComponent(new CubeBody({
                width: 1,
                height: 1,
                depth: 1,
            }));
        }
    }
    accept(data) {
        return false;
    }
    isDirty() {
        return this.updateTimestamp === -1;
    }
    read(data) {
        const cubeBody = this.entity?.getComponent(CubeBody);
        if (!cubeBody) {
            throw new Error(`Cannot find SphereBody component on entity ${this.entity?.id}`);
        }
        cubeBody.movable = data.movable;
        cubeBody.width = data.width;
        cubeBody.height = data.height;
        cubeBody.depth = data.depth;
    }
    write() {
        const cubeBody = this.entity?.getComponent(CubeBody);
        if (!cubeBody) {
            throw new Error(`Cannot find CubeBody component on entity ${this.entity?.id}`);
        }
        this.$updateTimestamp = Date.now();
        return {
            movable: cubeBody.movable,
            width: cubeBody.width,
            height: cubeBody.height,
            depth: cubeBody.depth,
        };
    }
    clone() {
        return new NetworkSphereBody();
    }
}
