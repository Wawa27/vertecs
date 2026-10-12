import type { RigidBody } from "@dimforge/rapier3d-compat";
import { Component } from "../core";

type RapierShape =
    | { type: "box"; size: [number, number, number] }
    | { type: "sphere"; size: [number] }
    | { type: "cylinder"; size: [number, number]; cylinderSides?: number }
    | { type: "trimesh"; vertices: Float32Array; indices: Uint32Array };

/** Dimensions are in world units; box sizes and cylinder heights are full lengths. */
export type RapierComponentOptions = RapierShape & {
    bodyType?: "fixed" | "dynamic" | "kinematic";
    density?: number;
    friction?: number;
    restitution?: number;
    disableRotation?: boolean;
    ccd?: boolean;
    linearDamping?: number;
    angularDamping?: number;
    collisionGroups?: number;
    contactForceEvents?: boolean;
    /** Collider translation relative to the rigid body's origin, in world-unit lengths. */
    colliderOffset?: [number, number, number];
};

export default class RapierComponent extends Component {
    public body?: RigidBody;

    public constructor(public readonly bodyOptions: RapierComponentOptions) {
        super();
    }

    public override clone(): RapierComponent {
        return new RapierComponent(this.bodyOptions);
    }
}
