import {Injectable} from '@angular/core';
import {Store} from '@ngrx/store';
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/map';

import {AppState} from './app.state';
import * as CounterActions from './counter/counter.actions';
import * as UserActions from "./user/user.actions";
import {EventBusService} from './shared/event-bus.service';
import {LiveAction} from "./shared/live-action.model";
import {environment} from "../environments/environment";

@Injectable()
export class AppEventBusService {

    private currentUser: string;

    constructor(private eventBusService: EventBusService,
                private store: Store<AppState>) {
        this.store.select(s => s.user.name)
        //.distinctUntilChanged()
            .subscribe(name => this.currentUser = name);
    }

    connect() {
        if (!this.enabled) {
            console.debug("AppEventBusService.connect - Disabled ");
        }

        // Subscribe to close event
        this.eventBusService.close.subscribe(() => {
            this.store.dispatch(new UserActions.ConnectionClosedAction());
        });
        // Subscribe to open event
        this.eventBusService.open.subscribe(() => {
            console.debug('AppEventBusService.open');
            this.subscribeToActions('counter::actions');

            this.initializeCounter();

            this.store.dispatch(new UserActions.ConnectionOpenedAction());
        });
        // Connect
        console.debug("AppEventBusService.connect " + environment.eventBusURL);
        this.eventBusService.connect(environment.eventBusURL, this.buildHeaders());
    }

    disconnect() {
        this.eventBusService.disconnect();
    }

    get connected(): boolean {
        return this.eventBusService.connected;
    }

    get enabled(): boolean {
        return environment.eventBusURL && environment.eventBusURL != '';
    }

    /**
     *
     */
    initializeCounter() {
        if (!this.enabled) return;
        if (this.connected) {
            let body: any = {};
            this.eventBusService.send('counter::total', body, (error, message) => {
                if (message && message.body) {
                    let localAction = new CounterActions.ResetAction();
                    localAction.payload = message.body;
                    this.store.dispatch(localAction);
                }
                if (error) {
                    console.error(error);
                }
            });
        }
    }

    /**
     *
     * @param action
     */
    publishAction(action: LiveAction) {
        if (!this.enabled) return;
        if (action.publishedByUser) {
            console.error("This action has already been published", action);
            return;
        }
        action.publishedByUser = this.currentUser;
        this.eventBusService.publish(action.eventBusAddress, action);
    }

    /**
     *
     * @param eventBusAddress
     */
    subscribeToActions(eventBusAddress: string) {
        if (!this.enabled) return;
        this.eventBusService.registerHandler(eventBusAddress, (error, message) => {
            if (error) {
                console.error('AppEventBusService.handleAction error', error);
                return;
            }
            if (!message.body) {
                console.error('AppEventBusService.handleAction - body is required in message', message);
                return;
            }
            if (message.body.publishedByUser === this.currentUser) {
                // Ignore action sent by current manager
                return;
            }
            let liveAction = message.body;
            this.store.dispatch(liveAction);
        });
    }

    /**
     *
     * @param eventBusAddress
     */
    unsubscribeFromActions(eventBusAddress: string) {
        if (!this.enabled) return;
        this.eventBusService.unregister(eventBusAddress);
    }

    // PRIVATE

    private buildHeaders() {
        // TODO Authentication header
        return {
            currentUser: this.currentUser
        };
    }

}
