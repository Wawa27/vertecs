import { vec3 } from "ts-gl-matrix";
import Body from "../bodies/Body";
import { Transform } from "../../math";
/**
 * Simple solver that pushes the bodies away from each other
 */
export default class DefaultSolver {
    solve(entity1, entity2, contactNormal) {
        const entity1Transform = entity1.getComponent(Transform);
        const entity2Transform = entity2.getComponent(Transform);
        const body1 = entity1.getComponent(Body);
        const body2 = entity2.getComponent(Body);
        if (!entity1Transform || !entity2Transform || !body1 || !body2) {
            throw new Error("Body or transform not found");
        }
        // Push the bodies away from each other using the contact normal
        if (body1.movable && body2.movable) {
            return;
        }
        if (body1.movable) {
            entity1Transform.translate(contactNormal);
            return;
        }
        entity2Transform.translate(vec3.negate(vec3.create(), contactNormal));
    }
    clone() {
        return new DefaultSolver();
    }
}
