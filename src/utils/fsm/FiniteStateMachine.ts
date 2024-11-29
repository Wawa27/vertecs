import { Component } from "../../core";
import State from "./State";
import { NetworkComponent } from "../../network";

export default class FiniteStateMachine extends NetworkComponent<string> {
    protected $initialStateName: string;

    protected $currentStateName?: string;

    protected $states: Map<string, State>;

    protected $transitions: Map<string, Map<string, State>>;

    public constructor(
        initialStateName: string,
        states?: { name: string; state: State }[],
        transitions?: { stateName: string; nextStateNames: string[] }[]
    ) {
        super();
        this.$initialStateName = initialStateName;

        this.$states = new Map();
        this.addStates(states ?? []);
        this.$transitions = new Map();
        this.addTransitions(transitions ?? []);
    }

    public accept(stateName: string): boolean {
        // TODO: Check if state exists and if the transition is valid
        return true;
    }

    public isDirty(lastStateName?: string): boolean {
        const finiteStateMachine =
            this.entity?.getComponent(FiniteStateMachine);

        return lastStateName !== finiteStateMachine?.currentStateName;
    }

    public write(): string {
        const finiteStateMachine =
            this.entity?.getComponent(FiniteStateMachine);
        return (
            finiteStateMachine!.currentStateName ??
            finiteStateMachine!.initialStateName
        );
    }

    public read(stateName: string): void {
        const finiteStateMachine =
            this.entity?.getComponent(FiniteStateMachine);

        if (!finiteStateMachine) return;

        finiteStateMachine.setNextState(stateName);
    }

    public addState(name: string, state: State): void {
        this.$states.set(name, state);
    }

    public addStates(states: { name: string; state: State }[]): void {
        states.forEach(({ name, state }) => this.addState(name, state));
    }

    public addTransition(stateName: string, nextStateNames: string[]): void {
        const state = this.$states.get(stateName);

        nextStateNames.forEach((nextStateName) => {
            const nextState = this.$states.get(nextStateName);

            if (!state || !nextState) {
                console.warn(
                    `State not found for transition : ${stateName} -> ${nextStateName}`
                );
                return;
            }

            let transitions = this.$transitions.get(stateName);
            if (!transitions) {
                this.$transitions.set(stateName, new Map());
                transitions = this.$transitions.get(stateName);
            }
            transitions?.set(nextStateName, nextState);
        });
    }

    public addTransitions(
        transitions: { stateName: string; nextStateNames: string[] }[]
    ): void {
        transitions.forEach(({ stateName, nextStateNames }) =>
            this.addTransition(stateName, nextStateNames)
        );
    }

    public setNextState(nextStateName: string): void {
        if (!this.$currentStateName) {
            this.$currentStateName = nextStateName;
            this.entity?.addComponent(this.getCurrentState()!);
            return;
        }

        if (nextStateName === this.$currentStateName) {
            return;
        }

        const transitions = this.$transitions.get(this.$currentStateName);

        if (!transitions) {
            throw new Error(
                `State "${this.$currentStateName}" has no transitions to other states`
            );
        }

        const nextState = transitions.get(nextStateName);
        if (!nextState) {
            throw new Error(
                `State "${this.$currentStateName}" has no transition to "${nextStateName}"`
            );
        }

        this.entity?.removeComponent(this.getCurrentState()!.constructor);
        this.$currentStateName = nextStateName;
        this.entity?.addComponent(this.getCurrentState()!);
    }

    public getCurrentState(): State | undefined {
        return this.$states.get(this.$currentStateName ?? "");
    }

    public get initialStateName(): string {
        return this.$initialStateName;
    }

    public set currentStateName(currentStateName: string) {
        this.$currentStateName = currentStateName;
    }

    public get currentStateName(): string | undefined {
        return this.$currentStateName;
    }

    public clone(): Component {
        return new FiniteStateMachine(
            this.$initialStateName,
            Array.from(this.$states.entries()).map(([name, state]) => ({
                name,
                state: state.clone(),
            })),
            Array.from(this.$transitions.entries()).map(
                ([stateName, transitions]) => ({
                    stateName,
                    nextStateNames: Array.from(transitions.keys()),
                })
            )
        );
    }
}
