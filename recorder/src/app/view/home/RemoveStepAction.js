import Action from '../../action.js';

var RemoveStepAction = new Action.Subject();

function reducerCreator(stepName) {
    return function removeStepReducer(state) {
        var newState,
            selectedStep = state.selectedStep,
            currentSavedSteps = Object.assign({}, state.savedSteps),
            step = {};

        delete currentSavedSteps[stepName];
        newState = Action.update(state, {
            savedSteps: { $set: currentSavedSteps}
        });
        
        if (selectedStep === stepName) {
            newState = Action.update(newState, {
                selectedStep: {$set: null}
            });
        }

        return newState;
    }
}

Action.register(RemoveStepAction.map(reducerCreator));

export default RemoveStepAction;