import { vec3 } from "ts-gl-matrix";
export default class MathUtils {
    static getEulerToDegrees(radians) {
        return radians * (180 / Math.PI);
    }
    /**
     * Convert a quaternion to euler angles.
     * Missing function from gl-matrix
     * @param quat
     * @param out
     */
    static getEulerFromQuat(out, quat) {
        const sinRCosP = 2 * (quat[3] * quat[0] + quat[1] * quat[2]);
        const cosRCosP = 1 - 2 * (quat[0] * quat[0] + quat[1] * quat[1]);
        const roll = Math.atan2(sinRCosP, cosRCosP);
        const sinP = 2 * (quat[3] * quat[1] - quat[2] * quat[0]);
        let pitch;
        if (Math.abs(sinP) >= 1)
            pitch = (Math.sign(sinP) * Math.PI) / 2;
        // use 90 degrees if out of range
        else
            pitch = Math.asin(sinP);
        const sinYCosP = 2 * (quat[3] * quat[2] + quat[0] * quat[1]);
        const cosYCosP = 1 - 2 * (quat[1] * quat[1] + quat[2] * quat[2]);
        const yaw = Math.atan2(sinYCosP, cosYCosP);
        vec3.set(out, MathUtils.getEulerToDegrees(roll), MathUtils.getEulerToDegrees(pitch), MathUtils.getEulerToDegrees(yaw));
        return out;
    }
}
