import {Action} from '@ngrx/store';

export const UserActionTypes = {
    CONNECTION_OPENED: '[User] Connection opened',
    CONNECTION_CLOSED: '[User] Connection closed',
    LOGIN: '[User] Login'
};

export class ConnectionOpenedAction implements Action {
    payload: any = null;
    type = UserActionTypes.CONNECTION_OPENED;
}

export class ConnectionClosedAction implements Action {
    payload: any = null;
    type = UserActionTypes.CONNECTION_CLOSED;
}

export class LoginAction implements Action {
    payload: string;
    type = UserActionTypes.LOGIN;

    constructor(userName: string) {
        this.payload = userName;
    }
}

export type UserActions =
    ConnectionOpenedAction
    | ConnectionClosedAction
    | LoginAction;
