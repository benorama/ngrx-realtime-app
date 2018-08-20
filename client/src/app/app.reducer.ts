import {ActionReducerMap} from '@ngrx/store';
import {AppState} from './app.state';
import {counterReducer} from './counter/counter.reducer';
import {userReducer} from './user/user.reducer';

export const reducers: ActionReducerMap<AppState> = {
    counter: counterReducer,
    user: userReducer
};
