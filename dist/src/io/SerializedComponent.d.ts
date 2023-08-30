/**
 * The json representation of a serialized component
 */
interface SerializedComponent<T> {
    id?: string;
    data: T;
    className: string;
}
export default SerializedComponent;
