import {UserActions, UserActionTypes} from './user.actions';
import {initialUserState, UserState} from './user.state';

export function userReducer(state = initialUserState, action: UserActions): UserState {
    switch (action.type) {

        case UserActionTypes.ConnectionOpened:
            return Object.assign({}, state, {
                connected: true
            });

        case UserActionTypes.ConnectionClosed:
            return Object.assign({}, state, {
                connected: false
            });

        case UserActionTypes.Login:
            return Object.assign({}, state, {
                authenticated: true,
                name: action.payload
            });

        default: {
            return state;
        }
    }
}
