import ExampleClientHandler from "./ExampleClientHandler";
import { ServerNetworkSystem } from "../../../../src";
import allowedNetworkComponents from "../SharedConfiguration";
export default class ExampleServerNetworkSystem extends ServerNetworkSystem {
    constructor() {
        super(allowedNetworkComponents, ExampleClientHandler);
    }
}
