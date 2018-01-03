import {Action} from '@ngrx/store';

export namespace UserActions {

    export const Types = {
        CONNECTION_OPENED: '[User] Connection opened',
        CONNECTION_CLOSED: '[User] Connection closed',
        LOGIN: '[User] Login'
    };

    export class ConnectionOpenedAction implements Action {
        readonly type = Types.CONNECTION_OPENED;
    }

    export class ConnectionClosedAction implements Action {
        readonly type = Types.CONNECTION_CLOSED;
    }

    export class LoginAction implements Action {
        payload: string;
        readonly type = Types.LOGIN;

        constructor(userName: string) {
            this.payload = userName;
        }
    }

    export type Actions =
        ConnectionOpenedAction
        | ConnectionClosedAction
        | LoginAction;
}


