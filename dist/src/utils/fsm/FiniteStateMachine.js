import { Component } from "../../core";
export default class FiniteStateMachine extends Component {
    $inialStateName;
    $currentStateName;
    $states;
    $transitions;
    constructor(initialStateName, states, transitions) {
        super();
        this.$inialStateName = initialStateName;
        this.$states = new Map();
        this.addStates(states ?? []);
        this.$transitions = new Map();
        this.addTransitions(transitions ?? []);
    }
    addState(name, state) {
        this.$states.set(name, state);
    }
    addStates(states) {
        states.forEach(({ name, state }) => this.addState(name, state));
    }
    addTransition(stateName, nextStateNames) {
        const state = this.$states.get(stateName);
        nextStateNames.forEach((nextStateName) => {
            const nextState = this.$states.get(nextStateName);
            if (!state || !nextState) {
                console.warn(`State not found for transition : ${stateName} -> ${nextStateName}`);
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
    addTransitions(transitions) {
        transitions.forEach(({ stateName, nextStateNames }) => this.addTransition(stateName, nextStateNames));
    }
    setNextState(nextStateName) {
        if (!this.$currentStateName) {
            this.$currentStateName = nextStateName;
            this.entity?.addComponent(this.getCurrentState());
            return;
        }
        if (nextStateName === this.$currentStateName) {
            return;
        }
        const transitions = this.$transitions.get(this.$currentStateName);
        if (!transitions) {
            throw new Error(`State "${this.$currentStateName}" has no transitions to other states`);
        }
        const nextState = transitions.get(nextStateName);
        if (!nextState) {
            throw new Error(`State "${this.$currentStateName}" has no transition to "${nextStateName}"`);
        }
        this.entity?.removeComponent(this.getCurrentState().constructor);
        this.$currentStateName = nextStateName;
        this.entity?.addComponent(this.getCurrentState());
    }
    getCurrentState() {
        return this.$states.get(this.$currentStateName ?? "");
    }
    get initialStateName() {
        return this.$inialStateName;
    }
    set currentStateName(currentStateName) {
        this.$currentStateName = currentStateName;
    }
    get currentStateName() {
        return this.$currentStateName;
    }
    clone() {
        return new FiniteStateMachine(this.$inialStateName, Array.from(this.$states.entries()).map(([name, state]) => ({
            name,
            state: state.clone(),
        })), Array.from(this.$transitions.entries()).map(([stateName, transitions]) => ({
            stateName,
            nextStateNames: Array.from(transitions.keys()),
        })));
    }
}
