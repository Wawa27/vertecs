/**
 * The json representation of a component that can be sent over the networking
 */
type SerializedComponent<T> = {
    data: T;
    id: string;
    className: string;
};

export default SerializedComponent;
