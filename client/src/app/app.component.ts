import {Component} from '@angular/core';

import {Observable} from 'rxjs/Observable';
import {Store} from '@ngrx/store';

import {AppState} from './app.state';
import {CounterActions} from './counter/counter.actions';
import {CounterState} from './counter/counter.state';
import {UserActions} from './user/user.actions';
import {UserState} from './user/user.state';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html'
})
export class AppComponent {

    counter$: Observable<CounterState>;
    user$: Observable<UserState>;

    constructor(private store: Store<AppState>) {
        this.counter$ = this.store.select(s => s.counter);
        this.user$ = this.store.select(s => s.user);
    }

    decrement() {
        this.store.dispatch(new CounterActions.DecrementAction());
    }

    increment() {
        this.store.dispatch(new CounterActions.IncrementAction());
    }

    login(userName) {
        this.store.dispatch(new UserActions.LoginAction(userName));
    }

    reset() {
        this.store.dispatch(new CounterActions.ResetAction());
    }

}
