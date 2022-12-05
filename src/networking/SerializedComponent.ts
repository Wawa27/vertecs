/**
 * The json representation of a component that can be sent over the networking
 */
export type SerializedComponent<T> = {
    data: T;
    id: string;
    className: string;
};
