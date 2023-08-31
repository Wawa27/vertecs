import { NetworkComponent } from "../index";
import Animation from "../../utils/Animation";
/**
 * Represents an animation being played on an entity
 */
export default class NetworkAnimation extends NetworkComponent {
    constructor() {
        super();
    }
    accept(data) {
        return true;
    }
    isDirty(lastData) {
        const animation = this.entity?.getComponent(Animation);
        return (lastData.name !== animation?.name ||
            lastData.duration !== animation?.duration ||
            lastData.startTime !== animation?.startTime ||
            lastData.repeat !== animation?.repeat);
    }
    read(data) {
        const animation = this.entity?.getComponent(Animation);
        if (!animation) {
            this.entity?.addComponent(new Animation(data.name, data.duration, data.repeat, data.startTime));
        }
        else {
            animation.name = data.name;
            animation.duration = data.duration;
            animation.startTime = data.startTime;
            animation.repeat = data.repeat;
        }
    }
    write() {
        const animation = this.entity?.getComponent(Animation);
        return {
            name: animation?.name ?? "",
            duration: animation?.duration ?? 0,
            startTime: animation?.startTime ?? 0,
            repeat: animation?.repeat ?? 0,
        };
    }
    clone() {
        return new NetworkAnimation();
    }
}
