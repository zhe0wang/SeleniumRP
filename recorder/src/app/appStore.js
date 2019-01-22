import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/merge';

var _state = {
    logs: [],
    eventsFilter: '',
    isRecording: false,
    clientActions: [],
    screenIndex: 0,
    savedSteps: {},
    settings: {
        selectorConfig: {
            attrsConfig: {
                id: {
                    enabled: true,
                    include: null,
                    exclude: null,
                },
                classList: {
                    enabled: true,
                    include: null,
                    exclude: null,
                },
                tagName: {
                    enabled: true,
                    include: null,
                    exclude: null,
                },
                target: {
                    enabled: true,
                    include: null,
                    exclude: null,
                },
                name: {
                    enabled: true,
                    include: null,
                    exclude: null,
                },
                type: {
                    enabled: true,
                    include: null,
                    exclude: null,
                }
            }
        },
        groupScroll: true
    }
},
    _updater = new Subject(),
    _actionProcessor = new Subject(),
    _actions = [];

function updateState(state) {
    _state = state;
    _updater.next(state);
}

function process(actionReducer) {
    var oldState = _state,
        state = actionReducer(_state);

    console.log(actionReducer.name);
    if (state && state !== oldState) {
        updateState(state);
    }
}

const AppStore = {
    updater: _updater,

    start: function () {
        _actionProcessor.subscribe(process);
        updateState(_state);
    },

    getState: function () {
        return _state;
    },

    register: function (action) {
        _actions.push(action);
        _actionProcessor = _actionProcessor.merge(action);
    }
};

export default AppStore;