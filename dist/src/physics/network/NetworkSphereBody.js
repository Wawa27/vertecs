import { NetworkComponent } from "../../network";
import SphereBody from "../bodies/SphereBody";
export default class NetworkSphereBody extends NetworkComponent {
    constructor() {
        super();
    }
    onAddedToEntity(entity) {
        const sphereBody = entity.getComponent(SphereBody);
        if (!sphereBody) {
            entity.addComponent(new SphereBody({
                radius: 0.5,
                movable: true,
                mass: 1,
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
        const sphereBody = this.entity?.getComponent(SphereBody);
        if (!sphereBody) {
            throw new Error(`Cannot find SphereBody component on entity ${this.entity?.id}`);
        }
        sphereBody.movable = data.movable;
        sphereBody.radius = data.radius;
    }
    write() {
        const sphereBody = this.entity?.getComponent(SphereBody);
        this.$updateTimestamp = Date.now();
        return {
            movable: sphereBody?.movable ?? true,
            radius: sphereBody?.radius ?? 0,
        };
    }
    clone() {
        return new NetworkSphereBody();
    }
}
