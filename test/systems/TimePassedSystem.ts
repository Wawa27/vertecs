import System from "../../src/System";
import Entity from "../../src/Entity";

export default class TimePassedSystem extends System {
  public timePassed: number;

  public constructor() {
    super([]);
    this.timePassed = 0;
  }

  protected onLoop(entities: Entity[], deltaTime: number): void {
    this.timePassed = deltaTime;
  }
}
