import Action from '../../action.js';

var UpdateStateAction = new Action.Subject();

function reducerCreator(update) {
    var reducer = function UpdateStateActionReducer(state) {
        var updateState = {};

        updateState[update.key] = {};
        updateState[update.key][update.operator || '$set'] = update.value;

        return Action.update(state, updateState);
    }

    reducer.outerParams = update;
    return reducer
}

Action.register(UpdateStateAction.map(reducerCreator));

export default UpdateStateAction;