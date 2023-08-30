import { QuatLike, Vec3Like } from "ts-gl-matrix";
export default class MathUtils {
    static getEulerToDegrees(radians: number): number;
    /**
     * Convert a quaternion to euler angles.
     * Missing function from gl-matrix
     * @param quat
     * @param out
     */
    static getEulerFromQuat(out: Vec3Like, quat: QuatLike): Vec3Like;
}
