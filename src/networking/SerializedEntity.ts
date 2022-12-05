import { SerializedComponent } from "./SerializedComponent";

/**
 * The json representation of an entity that can be sent over the networking
 */
export type SerializedEntity = {
    owner?: string;
    id: string;
    components: SerializedComponent<any>[];
};
