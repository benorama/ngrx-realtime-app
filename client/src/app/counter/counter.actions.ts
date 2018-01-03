import {RemoteAction} from '../shared/remote-action.model';

export namespace CounterActions {

    const COUNTER_ACTIONS_EVENT_BUS_ADDRESS = 'counter::actions';

    export const Types = {
        INCREMENT: '[Counter] Increment',
        DECREMENT: '[Counter] Decrement',
        RESET: '[Counter] Reset'
    };

    export class IncrementAction extends RemoteAction {
        readonly type = Types.INCREMENT;

        constructor() {
            super(COUNTER_ACTIONS_EVENT_BUS_ADDRESS);
        }
    }

    export class DecrementAction extends RemoteAction {
        readonly type = Types.DECREMENT;

        constructor() {
            super(COUNTER_ACTIONS_EVENT_BUS_ADDRESS);
        }
    }

    export class ResetAction extends RemoteAction {
        readonly type = Types.RESET;

        constructor() {
            super(COUNTER_ACTIONS_EVENT_BUS_ADDRESS);
        }
    }

    export type Actions =
        IncrementAction
        | DecrementAction
        | ResetAction;


}

