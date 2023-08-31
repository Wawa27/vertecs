import { BufferGeometry, Line, LineBasicMaterial, Vector3 } from "three";
import { vec3 } from "ts-gl-matrix";
import { Component, Entity } from "../core";
import ThreeObject3D from "./ThreeObject3D";
import { Transform } from "../math";
export default class ThreeComponentDebugger extends Component {
    constructor() {
        super();
    }
    onAddedToEntity(entity) {
        const forwardLineEntity = new Entity();
        const material = new LineBasicMaterial({ color: 0x0000ff });
        const points = [];
        points.push(new Vector3(0, 0, 0));
        points.push(new Vector3(0, 0, 2));
        const geometry = new BufferGeometry().setFromPoints(points);
        const line = new Line(geometry, material);
        forwardLineEntity.addComponent(new ThreeObject3D(line));
        const transform = entity.getComponent(Transform);
        forwardLineEntity.addComponent(new Transform(transform?.getVectorInModelSpace(vec3.create(), [0, 100, 0]), undefined, transform?.toWorldScale(vec3.create(), [1, 1, 1])));
        entity.addChild(forwardLineEntity);
    }
}
