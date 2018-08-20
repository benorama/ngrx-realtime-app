import {Component, HostBinding} from '@angular/core';

import {Observable} from 'rxjs';
import {select, Store} from '@ngrx/store';

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

    @HostBinding('attr.class') class = 'mx-auto';

    counter$: Observable<CounterState>;
    user$: Observable<UserState>;

    constructor(private store: Store<AppState>) {
        this.counter$ = this.store.pipe(select('counter'));
        this.user$ = this.store.pipe(select('user'));
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
