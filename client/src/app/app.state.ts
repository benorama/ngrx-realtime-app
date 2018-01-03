import {CounterState} from './counter';
import {UserState} from './user';

export interface AppState {
    counter: CounterState;
    user: UserState;
    // Add other states here
}
