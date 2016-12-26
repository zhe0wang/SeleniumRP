import React from 'react';
import SaveStepAction from './saveStepAction.js';
import UpdateStateAction from '../share/updateStateAction.js';
import Utility from '../../Utility.js';

const stepNameKey = 'stepName';
const stepDescriptionKey = 'stepDescription';

const closeDialog = () => {
    UpdateStateAction.next({
        key: 'toShowSaveStepDialog',
        value: false
    });
}

const onDialogKeyDown = (evt) => {
    if (evt.keyCode !== 27) {
        return;
    }

    closeDialog();
};

const onDialogCloseClick = () => {
    closeDialog();
};

const oncCancelClick = () => {
    closeDialog();
};

const handleSumbit = (evt, appState) => {
    var form = evt.target,
        formData,
        step = {};

    evt.preventDefault();
    formData = new FormData(form);
    step.name = formData.get(stepNameKey);
    step.description = (formData.get(stepDescriptionKey) || '').trim() || null;

    if (!appState.clientActions.length) {
        Utility.logError('Nothing to save yet');
        return;
    }

    if (appState.savedSteps[step.name]) {
        Utility.logError('Step name already exists!');
        return;
    }

    SaveStepAction.next(step);
    form.reset();
    closeDialog();
};

const saveStepDialog = ({appState}) => {
    return (
        <div tabIndex="0" className={appState.toShowSaveStepDialog ? "i-dialog" : "i-dialog i-hidden"} onKeyDown={onDialogKeyDown}>
            <div className="i-dialog-content">
                <div className="i-dialog-header">
                    <div className="i-dialog-title">Save Step</div>
                    <div className="i-dialog-close" onClick={onDialogCloseClick}>X</div>
                </div>
                <form onSubmit={(evt) => handleSumbit(evt, appState)}>
                    <div className="i-dialog-content-center">
                        <div className='i-dialog-table'>
                            <div className="i-dialog-row">
                                <div className='i-dialog-column i-dialog-label'>
                                    Name
                                </div>
                                <div className='i-dialog-column'>
                                    <input type='text' name={stepNameKey} ref={(i) => i && i.focus()} required></input>
                                </div>
                            </div>
                            <div className="i-dialog-row">
                                <div className='i-dialog-column i-dialog-label'>
                                    Description
                                </div>
                                <div className='i-dialog-column'>
                                    <textarea name={stepDescriptionKey} cols="50" rows="20"/>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="i-dialog-footer">
                        <button type="submit">OK</button>
                        <button type="reset" onClick={oncCancelClick}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default saveStepDialog;