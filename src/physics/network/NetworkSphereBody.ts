import { NetworkComponent } from "../../network";
import SphereBody from "../bodies/SphereBody";
import { Entity } from "../../core";

type SphereBodyData = {
    movable: boolean;
    radius: number;
};

export default class NetworkSphereBody extends NetworkComponent<SphereBodyData> {
    public constructor() {
        super();
    }

    public onAddedToEntity(entity: Entity) {
        const sphereBody = entity.getComponent(SphereBody);
        if (!sphereBody) {
            entity.addComponent(
                new SphereBody({
                    radius: 0.5,
                    movable: true,
                    mass: 1,
                })
            );
        }
    }

    public accept(data: SphereBodyData): boolean {
        return false;
    }

    public isDirty(): boolean {
        return this.updateTimestamp === -1;
    }

    public read(data: SphereBodyData): void {
        const sphereBody = this.entity?.getComponent(SphereBody);

        if (!sphereBody) {
            throw new Error(
                `Cannot find SphereBody component on entity ${this.entity?.id}`
            );
        }

        sphereBody.movable = data.movable;
        sphereBody.radius = data.radius;
    }

    public write(): SphereBodyData {
        const sphereBody = this.entity?.getComponent(SphereBody);

        this.$updateTimestamp = Date.now();
        return {
            movable: sphereBody?.movable ?? true,
            radius: sphereBody?.radius ?? 0,
        };
    }

    public clone(): NetworkSphereBody {
        return new NetworkSphereBody();
    }
}
