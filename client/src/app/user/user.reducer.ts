import {UserActions} from './user.actions';
import {initialUserState, UserState} from './user.state';

export function userReducer(state = initialUserState, action: any): UserState {
    switch (action.type) {

        case UserActions.Types.CONNECTION_OPENED:
            return Object.assign({}, state, {
                connected: true
            });

        case UserActions.Types.CONNECTION_CLOSED:
            return Object.assign({}, state, {
                connected: false
            });

        case UserActions.Types.LOGIN:
            return Object.assign({}, state, {
                authenticated: true,
                name: action.payload
            });

        default: {
            return state;
        }
    }
}
