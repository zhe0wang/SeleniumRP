import React from 'react';
import Utility from '../../Utility.js';
import EventsFilter from './filter/eventsFilter.js';
import SavedSteps from './savedSteps.js';
import ActionList from './actionList.js';
import ToggleStartAction from './toggleStartAction';
import AddWaitAction from './addWaitAction.js';
import SaveClientEventAction from '../share/saveClientEventAction.js';
import Chromer from '../../chromer.js';
import Notifier from '../../notifier.js';
import Icon from '../share/icon.js';
import HomeSvg from './menu.svg';
import SettingDialog from '../setting/settingDialog.js';
import SaveStepDialog from '../saveStep/saveStepDialog.js'
import UpdateStateAction from '../share/updateStateAction.js';

const handleClick = (appState) => {
    var start = !appState.isRecording,
        actionName = start ? 'start' : 'stop';

    if (appState.clientActions.length || Object.keys(appState.savedSteps).length) {
        ToggleStartAction.next();
        return;
    }

    Chromer.updateBackgroundState('isRecording', start);
    Chromer.sendMessage({action : actionName}, function (response) {
        if (response && response.success) {
            Utility.logSuccess(actionName);
            ToggleStartAction.next();
        }
    });

    Notifier.subscribe((message) => {
        if (message.notify === 'load' && start && appState.settings && Object.keys(appState.settings).length) {
            Chromer.sendMessage({
                action: 'updateconfig',
                value: appState.settings
            });
            console.log('start and update config');
        }
    });
};

const handleVerifyClick = () => Chromer.sendMessage({action : 'selecttarget'});

const handleAddWait = () => {
    var wait = prompt('How long to wait(ms)?', 1000),
        waitInt = parseInt(wait, 10);

        if (isNaN(waitInt)) {
            Utility.logError('Not a valid value');
        } else {
            AddWaitAction.next(waitInt);
        }
};

const handleExportClick = (appState) => {
    var steps = [];

    if (appState.clientActions.length) {
        Utility.logError('Please save step first!');
        return;
    }

    if (!appState.clientActions.length && !Object.keys(appState.savedSteps).length) {
        Utility.logError('Nothing to export!');
        return;
    }

    Object.keys(appState.savedSteps).forEach(function (step) {
        var stepContent = appState.savedSteps[step],
            content = {
                name: step,
                description: stepContent.description,
                actions: stepContent.actions
            };

        steps.push({
            name: step,
            description: stepContent.description,
            order: stepContent.order
        })
        Utility.saveFile(`${step}.json`, JSON.stringify(content, null, 4));
    });

    Utility.saveFile(`steps.json`, JSON.stringify({ steps: steps.sort((a, b) => a.order - b.order) }, null, 4));
};

const updateState = (key, value) => UpdateStateAction.next({key: key, value: value});

const toShowDialog = (name, toShow) => updateState(name, toShow);

const onDialogBtnClick = (evt, name) => toShowDialog(name, true);

const updatePartialScreenshot = (isPartial) => {
    var config = {
        key: 'isPartialScreenshot', 
        value: isPartial
    };
    UpdateStateAction.next(config);
    Chromer.sendMessage({action : 'updatestate', value: config});
}; 

const createScreenShotEvent = (appState) => {
    var sceenShotEvent;

    if (!appState.isRecording) {
        return;
    }

    if (!appState.isPartialScreenshot) {
        sceenShotEvent = { type: 'screenshot', screenIndex: appState.screenIndex + 1 };
        SaveClientEventAction.next(sceenShotEvent);
    } else {
        Chromer.sendMessage({action : 'screenshot'});
    }
};

const Home = ({appState}) => (
    <div>
        <div className='i-actions'>
            <button onClick={() => handleClick(appState) }>{appState.isRecording ? 'Stop' : 'Start'}</button>
            <div className='i-screenshot-wrapper'>
                <input type="checkbox" defaultChecked={appState.isPartialScreenshot} onChange={(evt) =>updatePartialScreenshot(evt.target.checked)}></input>Partial
                <button onClick={() => createScreenShotEvent(appState) } title='Ctrl+Shift+S'>
                    Screenshot
                </button>
            </div>
            <button onClick={handleVerifyClick} title='Ctrl+Shift+E'>Verify Target</button>
            <button onClick={handleAddWait}>Add Wait</button>
            <button onClick={(evt) => onDialogBtnClick(evt, 'toShowSaveStepDialog')}>Save Step</button>
            <button onClick={() => handleExportClick(appState) }>Export</button>
            <button className="i-action-setting" onClick={(evt) => onDialogBtnClick(evt, 'toShowSettingDialog')}>
                <Icon svg={HomeSvg} height={20} width={30} text='Settings'></Icon>
            </button>
        </div>
        <SavedSteps appState={appState} />
        <div className='i-events'>
            <EventsFilter appState={appState}/>
            <ActionList appState={appState}/>
        </div>
        <SettingDialog appState={appState}/>
        <SaveStepDialog appState={appState}/>
    </div>
);

export default Home;