import Action from '../../action.js';

var RemoveClientEventAction = new Action.Subject();

function reducerCreator(eventId) {
    return function removeClientEventReducer(state) {
        var selectedStep = state.selectedStep,
            actions = (selectedStep ? state.savedSteps[selectedStep].actions : state.clientActions).slice(),
            idx = actions.findIndex((event) => event.id === eventId),
            currentSavedSteps,
            timeDiff,
            nextAction;

        if (idx < 0) {
            return null;
        }

        timeDiff = actions[idx].timeDiff;
        nextAction = actions[idx + 1];
        if (nextAction) {
            nextAction.timeDiff += timeDiff;
        }

        actions.splice(idx, 1);

        if (!selectedStep) {
            return Action.update(state, {
                clientActions: {$set: actions}
            });
        } else if (actions.length){
            return Action.update(state, {
                savedSteps: {[selectedStep]: {actions: {$set: actions}}}
            });
        } else {
            currentSavedSteps = Object.assign({}, state.savedSteps);
            delete currentSavedSteps[selectedStep];

            return Action.update(state, {
                selectedStep: {$set: null},
                savedSteps: {$set: currentSavedSteps}
            });
        }
    }
}

Action.register(RemoveClientEventAction.map(reducerCreator));

export default RemoveClientEventAction;