import { ClientHandler, ServerNetworkSystem } from "../../../src";
import CounterNetworkComponent from "./CounterNetworkComponent";

export default class ScenarioServerNetworkSystem extends ServerNetworkSystem {
    public constructor(port: number) {
        super([CounterNetworkComponent], ClientHandler, undefined, 30, port);
    }
}
