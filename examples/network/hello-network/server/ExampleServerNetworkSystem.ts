import ExampleClientHandler from "./ExampleClientHandler";
import { ServerNetworkSystem } from "../../../../src";
import allowedNetworkComponents from "../SharedConfiguration";

export default class ExampleServerNetworkSystem extends ServerNetworkSystem {
    public constructor() {
        super(allowedNetworkComponents, ExampleClientHandler);
    }
}
