import React from 'react';
import RemoveStepAction from './RemoveStepAction.js';
import UpdateStateAction from '../share/updateStateAction.js';

const SavedSteps = ({ appState }) => {
    var savedSteps = appState.savedSteps,
        selectedStep = appState.selectedStep,
        steps = [];

    Object.keys(savedSteps).forEach((step) => {
        var stepContent = savedSteps[step];
        steps.splice(stepContent.order, 0, step);
    });

    return (
        <div className='i-steps'>
            <div className='i-steps-title'>Steps</div>
            {
                steps.map((step, idx) => {
                    var classname = 'i-steps-item' + (step === selectedStep ? ' i-steps-item-selected' : '');
                    return <div className={classname} key={idx} onClick={() => {
                            UpdateStateAction.next({
                                key: 'selectedStep',
                                value: selectedStep === step ? null : step
                            });
                        }}>
                        <div className='i-steps-item-remove' onClick={(evt) => {
                            evt.preventDefault();
                            evt.stopPropagation();

                            RemoveStepAction.next(step);
                        }}>&#10006;</div>
                        {step}
                    </div>
                })
            }
        </div>
    );
};

export default SavedSteps;