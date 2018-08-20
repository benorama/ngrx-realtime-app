import {CounterState} from './counter/counter.state';
import {UserState} from './user/user.state';

export interface AppState {
    counter: CounterState;
    user: UserState;
    // Add other states here
}
