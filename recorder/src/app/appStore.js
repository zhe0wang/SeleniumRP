import {Subject} from 'rxjs/Subject';
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
                    id: true,
                    tagName: true, 
                    classList: true, 
                    target: true, 
                    name: true, 
                    type: true
                },
                uniqueCssPath: false
            }
        }
    },
    _updater = new Subject(),
    _actionProcessor = new Subject(),
    _actions = [];

function updateState(state) {
    _state = state;
    _updater.next(state);  
}
 
function  process(actionReducer) {
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