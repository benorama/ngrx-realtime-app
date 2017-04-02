import '@ngrx/core/add/operator/select';
import 'rxjs/add/operator/map';
import {Action} from '@ngrx/store';
import {Observable} from 'rxjs/Observable';
import {UserActions, UserActionTypes} from './user.actions';
import {initialUserState, UserState} from './user.state';

export function userReducer(state = initialUserState, action: UserActions): UserState {
    switch (action.type) {

        case UserActionTypes.CONNECTION_OPENED:
            return Object.assign({}, state, {
                connected: true
            });

        case UserActionTypes.CONNECTION_CLOSED:
            return Object.assign({}, state, {
                connected: false
            });

        case UserActionTypes.LOGIN:
            return Object.assign({}, state, {
                authenticated: true,
                name: action.payload
            });

        default: {
            return state;
        }
    }
}
