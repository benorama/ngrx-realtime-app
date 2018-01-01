import {Action} from '@ngrx/store';

export enum UserActionTypes {
    ConnectionOpened = '[User] Connection opened',
    ConnectionClosed = '[User] Connection closed',
    Login = '[User] Login'
};

export class ConnectionOpenedAction implements Action {
    readonly type = UserActionTypes.ConnectionOpened;
}

export class ConnectionClosedAction implements Action {
    readonly type = UserActionTypes.ConnectionClosed;
}

export class LoginAction implements Action {
    payload: string;
    readonly type = UserActionTypes.Login;

    constructor(userName: string) {
        this.payload = userName;
    }
}

export type UserActions =
    ConnectionOpenedAction
    | ConnectionClosedAction
    | LoginAction;
