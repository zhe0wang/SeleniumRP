import Action from '../../action.js';

var SaveClientEventAction = new Action.Subject();
var actionTypeMap = {
        dblclick: getDblClickClientActions,
        keyup: getKeyUpClientActions,
        scroll: getScrollActions,
    };

function isSameTarget(action1, action2) {
    return action1.cssPath === action2.cssPath;
}

function getDblClickClientActions (actions, action) {
    var lastAction = actions && actions[actions.length - 1],
        isSame = isSameTarget(lastAction, action),
        secondLastAction,
        clientActions;

    if (!lastAction || !isSame || lastAction.type !== 'click' || action.timeDiff > 500) {
        return null;
    }

    clientActions = actions.slice(0, actions.length);
    secondLastAction = clientActions.pop();
    lastAction = clientActions[clientActions.length - 1],
    isSame = isSameTarget(lastAction, action);

    if (!lastAction || !isSame || lastAction.type !== 'click' || secondLastAction.timeDiff > 500) {
        return null;
    }

    clientActions.pop();
    clientActions.push(action);
    return { $set: clientActions };
}

function getKeyUpClientActions (actions, action) {
    var lastAction = actions && actions[actions.length - 1],
        isSame = isSameTarget(lastAction, action),
        clientActions;

    if (!lastAction || !isSame || lastAction.type !== 'keyup') {
        return null;
    }

    clientActions = actions.slice(0, actions.length);
    clientActions.pop();
    clientActions.push(action);
    return { $set: clientActions };
}

function getScrollActions(actions, action, state) {
    var lastAction = actions && actions[actions.length - 1],
        isSame = isSameTarget(lastAction, action),
        clientActions;

    if (!state.settings.groupScroll || !lastAction || !isSame || lastAction.type !== 'scroll') {
        return null;
    }

    clientActions = actions.slice(0, actions.length);
    clientActions.pop();
    clientActions.push(action);
    return { $set: clientActions };
}

function reducerCreator(clientAction) {
    return function saveClientEventReducer(state) {
        var screenIndex,
            currentActions,
            updateState;

        if (clientAction && clientAction.type && state.isRecording) {
            currentActions = state.clientActions;
            screenIndex = clientAction.screenIndex || state.screenIndex
            if (clientAction.type === 'screenshot' && !(clientAction.screenIndex >= 0)) {
                screenIndex += 1;
                clientAction.screenIndex = screenIndex;
            }

            updateState = {
                screenIndex: {$set: screenIndex}
            };

            updateState.clientActions = (actionTypeMap[clientAction.type] && actionTypeMap[clientAction.type](currentActions, clientAction, state)) || { $push: [clientAction] };
            return Action.update(state, updateState);
        }

        return null;
    }
}

Action.register(SaveClientEventAction.map(reducerCreator));

export default SaveClientEventAction;