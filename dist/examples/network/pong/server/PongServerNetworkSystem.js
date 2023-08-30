import { ServerNetworkSystem } from "../../../../src";
import allowedNetworkComponents from "../shared/SharedConfiguration";
import PongNetworkClientHandler from "./PongNetworkClientHandler";
export default class PongServerNetworkSystem extends ServerNetworkSystem {
    constructor() {
        super(allowedNetworkComponents, PongNetworkClientHandler, 16);
    }
}
