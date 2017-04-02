import {Injectable} from '@angular/core';
import {Effect, Actions} from '@ngrx/effects';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/of';
import {AppEventBusService} from "./app.event-bus.service";
import {UserActionTypes} from './user/user.actions';
import {LiveAction} from "./shared/live-action.model";

@Injectable()
export class AppEventBusEffects {

    constructor(private actions$: Actions,
                private appEventBusService: AppEventBusService) {
    }

    // Listen to all actions and publish live actions to account event bus
    @Effect({dispatch: false}) liveAction$ = this.actions$
        .filter(action => action instanceof LiveAction && action.publishedByUser == undefined)
        .do((action: LiveAction) => {
            this.appEventBusService.publishAction(action);
        });

    @Effect({dispatch: false}) login$ = this.actions$
        .ofType(UserActionTypes.LOGIN)
        .do(() => {
            this.appEventBusService.connect();
        });

}
