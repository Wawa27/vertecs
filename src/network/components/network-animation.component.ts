import { Component } from "../../core";
import { NetworkComponent } from "../index";
import Animation from "../../utils/Animation";

type AnimationData = {
    name: string;
    duration: number;
    startTime: number;
    repeat: number;
};

/**
 * Represents an animation being played on an entity
 */
export default class NetworkAnimation extends NetworkComponent<AnimationData> {
    public constructor() {
        super();
    }

    public accept(data: AnimationData): boolean {
        return true;
    }

    public isDirty(lastData: AnimationData): boolean {
        const animation = this.entity?.getComponent(Animation);

        return (
            lastData.name !== animation?.name ||
            lastData.duration !== animation?.duration ||
            lastData.startTime !== animation?.startTime ||
            lastData.repeat !== animation?.repeat
        );
    }

    public read(data: AnimationData): void {
        const animation = this.entity?.getComponent(Animation);

        if (!animation) {
            this.entity?.addComponent(
                new Animation(
                    data.name,
                    data.duration,
                    data.repeat,
                    data.startTime
                )
            );
        } else {
            animation.name = data.name;
            animation.duration = data.duration;
            animation.startTime = data.startTime;
            animation.repeat = data.repeat;
        }
    }

    public write(): AnimationData {
        const animation = this.entity?.getComponent(Animation);

        return {
            name: animation?.name ?? "",
            duration: animation?.duration ?? 0,
            startTime: animation?.startTime ?? 0,
            repeat: animation?.repeat ?? 0,
        };
    }

    public clone(): Component {
        return new NetworkAnimation();
    }
}
