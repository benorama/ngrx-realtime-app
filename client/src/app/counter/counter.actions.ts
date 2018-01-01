import {RemoteAction} from '../shared/remote-action.model';

const COUNTER_ACTIONS_EVENT_BUS_ADDRESS = 'counter::actions';

export enum CounterActionTypes {
    Increment = '[Counter] Increment',
    Decrement = '[Counter] Decrement',
    Reset = '[Counter] Reset'
};

export class IncrementAction extends RemoteAction {
    readonly type = CounterActionTypes.Increment;
    constructor() {
        super(COUNTER_ACTIONS_EVENT_BUS_ADDRESS);
    }
}

export class DecrementAction extends RemoteAction {
    readonly type = CounterActionTypes.Decrement;
    constructor() {
        super(COUNTER_ACTIONS_EVENT_BUS_ADDRESS);
    }
}

export class ResetAction extends RemoteAction {
    readonly type = CounterActionTypes.Reset;
    constructor() {
        super(COUNTER_ACTIONS_EVENT_BUS_ADDRESS);
    }
}

export type CounterActions =
    IncrementAction
    | DecrementAction
    | ResetAction;
