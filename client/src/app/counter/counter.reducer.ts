import {CounterActions} from './counter.actions';
import {initialCounterState, CounterState} from './counter.state';

export function counterReducer(state = initialCounterState, action: CounterActions.Actions): CounterState {
    switch (action.type) {

        case CounterActions.Types.INCREMENT:
            return Object.assign({}, state, {
                total: state.total + 1
            });

        case CounterActions.Types.DECREMENT:
            return Object.assign({}, state, {
                total: state.total - 1
            });

        case CounterActions.Types.RESET:
            if (action.payload) {
                return action.payload;
            } else {
                return initialCounterState;
            }


        default: {
            return state;
        }
    }
}
