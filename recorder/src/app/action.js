import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import update from 'react-addons-update';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/dom/ajax';
import AppStore from './appStore.js';

const Action = {
    Subject: Subject,
    Observable: Observable,
    update: update,
    register: function (obs) {
        AppStore.register(obs);
    }
};

export default Action;