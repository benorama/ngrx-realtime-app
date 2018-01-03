import {ActionReducerMap} from '@ngrx/store';
import {AppState} from './app.state';
import {counterReducer} from './counter';
import {userReducer} from './user';

export const reducers: ActionReducerMap<AppState> = {
    counter: counterReducer,
    user: userReducer
};
