import '@ngrx/core/add/operator/select';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/let';
import {combineReducers} from '@ngrx/store';
import {compose} from '@ngrx/core/compose';
import {storeLogger} from 'ngrx-store-logger';
import {storeFreeze} from 'ngrx-store-freeze';
import {share, Selector} from './shared/util';
import {environment} from '../environments/environment';
import {counterReducer} from './counter';
import {userReducer} from './user';

const reducers = {
    counter: counterReducer,
    user: userReducer
};

const developmentReducer = compose(storeFreeze, storeLogger(), combineReducers)(reducers);
const productionReducer = combineReducers(reducers);

export function reducer(state: any, action: any) {
    if (environment.production) {
        return productionReducer(state, action);
    }
    else {
        return developmentReducer(state, action);
    }
}
