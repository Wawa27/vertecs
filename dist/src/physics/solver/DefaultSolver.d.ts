import { Vec3Like } from "ts-gl-matrix";
import { Entity } from "../../core";
/**
 * Simple solver that pushes the bodies away from each other
 */
export default class DefaultSolver {
    solve(entity1: Entity, entity2: Entity, contactNormal: Vec3Like): void;
    clone(): DefaultSolver;
}
