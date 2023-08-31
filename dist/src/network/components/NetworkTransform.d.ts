import { Component, Entity } from "../../core";
import NetworkComponent from "../NetworkComponent";
export type TransformData = {
    position: [number, number, number];
    rotation: [number, number, number, number];
    scale: [number, number, number];
};
export default class NetworkTransform extends NetworkComponent<TransformData> {
    constructor();
    onAddedToEntity(entity: Entity): void;
    accept(data: TransformData): boolean;
    read(data: TransformData): void;
    isDirty(lastData: TransformData): boolean;
    write(): TransformData;
    clone(): Component;
}
