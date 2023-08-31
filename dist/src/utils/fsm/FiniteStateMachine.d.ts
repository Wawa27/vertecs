import { Component } from "../../core";
import State from "./State";
export default class FiniteStateMachine extends Component {
    protected $inialStateName: string;
    protected $currentStateName?: string;
    protected $states: Map<string, State>;
    protected $transitions: Map<string, Map<string, State>>;
    constructor(initialStateName: string, states?: {
        name: string;
        state: State;
    }[], transitions?: {
        stateName: string;
        nextStateNames: string[];
    }[]);
    addState(name: string, state: State): void;
    addStates(states: {
        name: string;
        state: State;
    }[]): void;
    addTransition(stateName: string, nextStateNames: string[]): void;
    addTransitions(transitions: {
        stateName: string;
        nextStateNames: string[];
    }[]): void;
    setNextState(nextStateName: string): void;
    getCurrentState(): State | undefined;
    get initialStateName(): string;
    set currentStateName(currentStateName: string);
    get currentStateName(): string | undefined;
    clone(): Component;
}
