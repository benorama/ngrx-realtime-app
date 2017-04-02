export interface UserState {

    authenticated: boolean;
    connected: boolean;
    name: string;

}

export let initialUserState: UserState = {
    authenticated: false,
    connected: false,
    name: null
};
