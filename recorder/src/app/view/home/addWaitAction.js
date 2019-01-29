import Action from '../../action.js';
import shortid from 'shortid';

var AddWaitAction = new Action.Subject();

function reducerCreator(wait) {
    return function addWaitReducer(state) {
        var clientAction;
        if (!state.isRecording) {
            return;
        }

        clientAction = {
            type: 'wait',
            value: wait
        };
        
        return Action.update(state, {
            clientActions: { $push: [clientAction] }
        });
    }
}

Action.register(AddWaitAction.map(reducerCreator));

export default AddWaitAction;