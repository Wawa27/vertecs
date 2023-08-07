import { Component } from "../../core";
import State from "./State";
import { SerializableComponent } from "../../io";

type FiniteStateMachineData = {
    currentStateName: string;
    states: { name: string; data: string }[];
    transitions: {
        stateName: string;
        nextStates: { name: string; data: string }[];
    }[];
};

export default class FiniteStateMachine extends SerializableComponent<FiniteStateMachineData> {
    public static readonly States: typeof State[] = [];

    #currentStateName: string;

    #states: Map<string, State>;

    #transitions: Map<string, Map<string, State>>;

    public constructor(
        initialStateName: string,
        states?: Map<string, State>,
        transitions?: Map<string, Map<string, State>>
    ) {
        super();
        this.#currentStateName = initialStateName;
        this.#states = states ?? new Map();
        this.#transitions = transitions ?? new Map();
    }

    public start(): void {
        this.#states.get(this.#currentStateName)?.onEnter(this.entity);
    }

    public addState(name: string, state: State): void {
        this.#states.set(name, state);
    }

    public addStates(states: { name: string; state: State }[]): void {
        states.forEach(({ name, state }) => this.addState(name, state));
    }

    public addTransition(stateName: string, nextStateNames: string[]): void {
        const state = this.#states.get(stateName);

        nextStateNames.forEach((nextStateName) => {
            const nextState = this.#states.get(nextStateName);

            if (!state || !nextState) {
                console.warn(
                    `State not found for transition : ${stateName} -> ${nextStateName}`
                );
                return;
            }

            let transitions = this.#transitions.get(stateName);
            if (!transitions) {
                this.#transitions.set(stateName, new Map());
                transitions = this.#transitions.get(stateName);
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
        if (nextStateName === this.#currentStateName) {
            return;
        }

        const transitions = this.#transitions.get(this.#currentStateName);

        if (!transitions) {
            throw new Error(
                `State "${
                    this.#currentStateName
                }" has no transitions to other states`
            );
        }

        const nextState = transitions.get(nextStateName);
        if (!nextState) {
            throw new Error(
                `State "${
                    this.#currentStateName
                }" has no transition to "${nextStateName}"`
            );
        }

        const currentState = this.#states.get(this.#currentStateName);
        currentState?.onLeave(this.entity);
        this.#currentStateName = nextStateName;
        nextState.onEnter(this.entity);
    }

    public onLoop(deltaTime: number): void {
        const currentState = this.#states.get(this.#currentStateName);
        currentState?.onLoop(deltaTime, this.entity);
    }

    public write() {
        return {
            currentStateName: this.#currentStateName,
            states: [...this.#states].map(([name, state]) => ({
                name,
                data: state.serialize(),
            })),
            transitions: [...this.#transitions].map(([name, state]) => ({
                stateName: name,
                nextStates: [...state].map(([nextStateName, nextState]) => ({
                    name: nextStateName,
                    data: nextState.serialize(),
                })),
            })),
        };
    }

    public read(data: any): void {
        this.#currentStateName = data.currentState;
        this.#states = new Map();
        data.states.forEach((stateJson: any) => {
            const state = FiniteStateMachine.States.find(
                (State) => State.constructor.name === stateJson.name
            )?.deserialize(stateJson);
            if (!state) {
                throw new Error(`State not found : ${stateJson.name}`);
            }
            this.#states.set(stateJson.name, state);
        });
        this.#transitions = new Map();
        data.transitions.forEach(
            (transition: {
                stateName: string;
                nextStates: { name: string; data: string }[];
            }) => {
                const state = this.#states.get(transition.stateName);
                if (!state) {
                    throw new Error(
                        `State not found : ${transition.stateName}`
                    );
                }
                const nextStates = new Map();
                this.#transitions.set(transition.stateName, nextStates);
                transition.nextStates.forEach((nextStateJson: any) => {
                    const nextState = FiniteStateMachine.States.find(
                        (State) => State.constructor.name === nextStateJson.name
                    )?.deserialize(nextStateJson);
                    if (!nextState) {
                        throw new Error(
                            `State not found : ${nextStateJson.name}`
                        );
                    }
                    nextStates.set(nextStateJson.name, nextState);
                });
            }
        );
    }

    public get currentStateName(): string {
        return this.#currentStateName;
    }

    public clone(): Component {
        return new FiniteStateMachine(
            this.#currentStateName,
            this.#states,
            this.#transitions
        );
    }
}
