/**
 * The json representation of a serialized component
 */
type SerializedComponent<T> = {
    data: T;
    id: string;
    className: string;
};

export default SerializedComponent;
