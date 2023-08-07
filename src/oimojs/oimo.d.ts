import "oimo";

declare module "oimo" {
    import "oimo";

    export type BodyOptions = {
        type?: "sphere" | "box" | "cylinder";
        size?: [number] | [number, number, number];
        pos?: [number, number, number];
        rot?: [number, number, number];
        move?: boolean;
        density?: number;
        friction?: number;
        restitution?: number;
        belongsTo?: number;
        collidesWith?: number;
        disableRotation?: boolean;
    };

    export class World {
        constructor(options?: {
            timestep?: number;
            iterations?: number;
            broadphase?: number;
            worldscale?: number;
            random?: boolean;
            info?: boolean;
        });

        add(bodyOptions: BodyOptions): Body;

        step(): void;
    }

    export class Vec3 {
        x: number;

        y: number;

        z: number;

        set(x: number, y: number, z: number): void;
    }

    export class Vec4 {
        x: number;

        y: number;

        z: number;

        w: number;

        set(x: number, y: number, z: number, w: number): void;
    }

    export class Body {
        entityId?: string;

        position: Vec3;

        quaternion: Vec4;

        angularVelocity: Vec3;

        resetPosition(x: number, y: number, z: number): void;

        getPosition(): { x: number; y: number; z: number };

        getQuaternion(): { x: number; y: number; z: number; w: number };
    }
}
