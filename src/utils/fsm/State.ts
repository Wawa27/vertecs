import { Entity } from "../../core";

export default abstract class State {
    protected constructor() {}

    public abstract onEnter(entity?: Entity): void;

    public abstract onLoop(deltaTime: number, entity?: Entity): void;

    public abstract onLeave(entity?: Entity): void;

    public serialize(): any {
        return {
            name: this.constructor.name,
        };
    }

    public static deserialize(json: any): State {
        return new (this.constructor as any)();
    }
}
