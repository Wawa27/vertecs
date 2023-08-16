import { NetworkComponent } from "../../network";
import { Entity } from "../../core";
import CubeBody from "../bodies/CubeBody";

type CubeBodyData = {
    movable: boolean;
    width: number;
    height: number;
    depth: number;
};

export default class NetworkSphereBody extends NetworkComponent<CubeBodyData> {
    public constructor() {
        super();
    }

    public onAddedToEntity(entity: Entity) {
        const cubeBody = entity.getComponent(CubeBody);
        if (!cubeBody) {
            entity.addComponent(new CubeBody(1, 1, 1));
        }
    }

    public accept(data: CubeBodyData): boolean {
        return false;
    }

    public shouldUpdate(): boolean {
        return this.updateTimestamp === -1;
    }

    public read(data: CubeBodyData): void {
        const cubeBody = this.entity?.getComponent(CubeBody);

        if (!cubeBody) {
            throw new Error(
                `Cannot find SphereBody component on entity ${this.entity?.id}`
            );
        }

        cubeBody.movable = data.movable;
        cubeBody.width = data.width;
        cubeBody.height = data.height;
        cubeBody.depth = data.depth;
    }

    public write(): CubeBodyData {
        const cubeBody = this.entity?.getComponent(CubeBody);

        if (!cubeBody) {
            throw new Error(
                `Cannot find CubeBody component on entity ${this.entity?.id}`
            );
        }

        this.$updateTimestamp = Date.now();
        return {
            movable: cubeBody.movable,
            width: cubeBody.width,
            height: cubeBody.height,
            depth: cubeBody.depth,
        };
    }

    public clone(): NetworkSphereBody {
        return new NetworkSphereBody();
    }
}
