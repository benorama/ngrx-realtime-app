import {Action} from '@ngrx/store';
import {LiveAction} from "../shared/live-action.model";

const COUNTER_ACTIONS_EVENT_BUS_ADDRESS: string = 'counter::actions';

export const CounterActionTypes = {
    INCREMENT: '[Counter] Increment',
    DECREMENT: '[Counter] Decrement',
    RESET: '[Counter] Reset'
};

export class IncrementAction extends LiveAction {
    payload: any = null;
    type = CounterActionTypes.INCREMENT;
    constructor() {
        super(COUNTER_ACTIONS_EVENT_BUS_ADDRESS);
    }
}

export class DecrementAction extends LiveAction {
    payload: any = null;
    type = CounterActionTypes.DECREMENT;
    constructor() {
        super(COUNTER_ACTIONS_EVENT_BUS_ADDRESS);
    }
}

export class ResetAction extends LiveAction {
    payload: any = null;
    type = CounterActionTypes.RESET;
    constructor() {
        super(COUNTER_ACTIONS_EVENT_BUS_ADDRESS);
    }
}

export type CounterActions =
    IncrementAction
    | DecrementAction
    | ResetAction;
