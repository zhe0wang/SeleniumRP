import Action from '../../action.js';
import Chromer from '../../chromer.js';

var ToggleStartAction = new Action.Subject();

function reducerCreator(value) {
    return function startReducer(state) {
        var start = !state.isRecording,
            actionName = start ? 'start' : 'stop',
            action = {name: actionName},
            newState;

        newState = Action.update(state, {
            logs: {$push: [action]},
            isRecording: {$set: start}
        });

        return newState;
    }
}

Action.register(ToggleStartAction.map(reducerCreator));

export default ToggleStartAction;