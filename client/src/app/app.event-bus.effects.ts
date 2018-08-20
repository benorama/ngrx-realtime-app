import {Injectable} from '@angular/core';
import {Action} from '@ngrx/store';
import {Effect, Actions, ofType} from '@ngrx/effects';
import {Observable} from 'rxjs';
import {filter, tap} from 'rxjs/operators';

import {AppEventBusService} from './app.event-bus.service';
import {UserActions} from './user/user.actions';
import {RemoteAction} from './shared/remote-action.model';

@Injectable()
export class AppEventBusEffects {

    constructor(private actions$: Actions,
                private appEventBusService: AppEventBusService) {
    }

    // Listen to all actions and publish remote actions to account event bus
    @Effect({dispatch: false}) remoteAction$: Observable<Action> = this.actions$.pipe(
        filter(action => action instanceof RemoteAction && action.publishedByUser === undefined),
        tap((action: RemoteAction) => {
            this.appEventBusService.publishAction(action);
        })
    );


    @Effect({dispatch: false}) login$: Observable<Action> = this.actions$.pipe(
        ofType(UserActions.Types.LOGIN),
        tap(() => {
            this.appEventBusService.connect();
        })
    );

}
