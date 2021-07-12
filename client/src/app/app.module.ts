import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {EffectsModule} from '@ngrx/effects';
import {StoreModule} from '@ngrx/store';
import {StoreDevtoolsModule} from '@ngrx/store-devtools';
import {environment} from '../environments/environment';

import {reducers} from './app.reducer';
import {AppComponent} from './app.component';
import {AppEventBusEffects} from './app.event-bus.effects';
import {AppEventBusService} from './app.event-bus.service';
import {EventBusService} from './shared/event-bus.service';

@NgModule({
    bootstrap: [
        AppComponent
    ],
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        StoreModule.forRoot(reducers, {
            runtimeChecks: {
                strictActionImmutability: false
            }
        }),
        EffectsModule.forRoot([AppEventBusEffects]),
        !environment.production ? StoreDevtoolsModule.instrument({maxAge: 25}) : []
    ],
    providers: [
        EventBusService, // Should be first, since AppEventBusService depends on it
        AppEventBusService
    ]
})
export class AppModule {
}
