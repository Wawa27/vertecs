import SerializedComponent from "./SerializedComponent";

/**
 * The json representation of an entity
 */
type SerializedEntity = {
    id: string;
    components: SerializedComponent<any>[];
};

export default SerializedEntity;
