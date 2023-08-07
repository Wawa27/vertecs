import { vec3 } from "gl-matrix";
import SphereBody from "./bodies/SphereBody";
import { Entity } from "../core";
import { Transform } from "../math";

export default class Ray {
    #origin: vec3;

    #direction: vec3;

    public constructor(origin: vec3, direction: vec3) {
        this.#origin = origin;
        this.#direction = direction;
    }

    public getSphereIntersection(sphereEntity: Entity): vec3 | undefined {
        const sphereWorldPosition = sphereEntity
            .getComponent(Transform)
            ?.getWorldPosition(vec3.create());
        const radius = sphereEntity.getComponent(SphereBody)?.radius;

        if (!sphereWorldPosition || !radius) {
            throw new Error("Sphere transform not found");
        }

        const a = vec3.dot(this.#direction, this.#direction);
        const b =
            2 *
            vec3.dot(
                vec3.subtract(vec3.create(), this.#origin, sphereWorldPosition),
                this.#direction
            );
        const c =
            vec3.dot(
                vec3.subtract(vec3.create(), this.#origin, sphereWorldPosition),
                vec3.subtract(vec3.create(), this.#origin, sphereWorldPosition)
            ) -
            radius ** 2;

        const discriminant = b ** 2 - 4 * a * c;

        if (discriminant < 0) {
            return undefined;
        }

        const t1 = (-b + Math.sqrt(discriminant)) / (2 * a);
        const t2 = (-b - Math.sqrt(discriminant)) / (2 * a);

        return vec3.add(
            vec3.create(),
            this.#origin,
            vec3.scale(vec3.create(), this.#direction, Math.min(t1, t2))
        );
    }

    public get origin(): vec3 {
        return this.#origin;
    }

    public get direction(): vec3 {
        return this.#direction;
    }
}
