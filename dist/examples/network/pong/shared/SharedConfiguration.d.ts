import { NetworkCubeBody, NetworkSphereBody, NetworkTransform } from "../../../../src";
import NetworkVelocity from "./NetworkVelocity";
declare const allowedNetworkComponents: (typeof NetworkTransform | typeof NetworkSphereBody | typeof NetworkCubeBody | typeof NetworkVelocity)[];
export default allowedNetworkComponents;
