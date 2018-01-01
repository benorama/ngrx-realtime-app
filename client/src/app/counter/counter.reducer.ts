import {CounterActions, CounterActionTypes} from './counter.actions';
import {initialCounterState, CounterState} from './counter.state';

export function counterReducer(state = initialCounterState, action: CounterActions): CounterState {
    switch (action.type) {

        case CounterActionTypes.Increment:
            return Object.assign({}, state, {
                total: state.total + 1
            });

        case CounterActionTypes.Decrement:
            return Object.assign({}, state, {
                total: state.total - 1
            });

        case CounterActionTypes.Reset:
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
