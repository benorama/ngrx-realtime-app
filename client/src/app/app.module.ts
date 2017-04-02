import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {StoreModule} from '@ngrx/store';
import {StoreDevtoolsModule} from '@ngrx/store-devtools';
import {EffectsModule} from '@ngrx/effects';

import {reducer} from './app.reducer';
import {AppComponent} from './app.component';
import {AppEventBusEffects} from './app.event-bus.effects';
import {AppEventBusService} from "./app.event-bus.service";
import {EventBusService} from "./shared/event-bus.service";

@NgModule({
    bootstrap: [
        AppComponent
    ],
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        StoreModule.provideStore(reducer),
        StoreDevtoolsModule.instrumentOnlyWithExtension(),
        EffectsModule.runAfterBootstrap(AppEventBusEffects)
    ],
    providers: [
        EventBusService, // Should be first, since AppEventBusService depends on it
        AppEventBusService
    ]
})
export class AppModule {
}
