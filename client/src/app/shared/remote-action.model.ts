import {Action} from "@ngrx/store";

export abstract class RemoteAction implements Action {

    payload: any = null;
    publishedByUser: string;
    type: string;

    constructor(public eventBusAddress: string) {
    }

}
