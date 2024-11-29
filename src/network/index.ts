import ServerNetworkSystem from "./server/ServerNetworkSystem";
import ClientNetworkSystem from "./client/ClientNetworkSystem";
import NetworkComponent from "./NetworkComponent";
import ClientHandler from "./server/ClientHandler";
import IsPlayer from "./IsPlayer";
import type { CustomData } from "./GameState";
import NetworkTransform from "./components/NetworkTransform";
import NetworkAnimation from "./components/NetworkAnimation";
import IsNetworked from "./IsNetworked";
import type { NetworkScope } from "./IsNetworked";

export type { CustomData, NetworkScope };
export {
    ServerNetworkSystem,
    ClientNetworkSystem,
    NetworkComponent,
    ClientHandler,
    IsPlayer,
    NetworkTransform,
    IsNetworked,
    NetworkAnimation,
};
