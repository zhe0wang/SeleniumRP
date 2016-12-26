import Action from '../../action.js';

var SaveStepAction = new Action.Subject();

function reducerCreator(stepConfig) {
    return function saveStepReducer(state) {
        var newState,
            actions = state.clientActions.slice(),
            order = Object.keys(state.savedSteps).length,
            step = {};

        step[stepConfig.name] = {
            order: order,
            description: stepConfig.description,
            actions: actions
        };
        
        newState = Action.update(state, {
            savedSteps: { $merge: step},
            clientActions: {$set: []},
            screenIndex: {$set: 0}
        });

        return newState;
    }
}

Action.register(SaveStepAction.map(reducerCreator));

export default SaveStepAction;