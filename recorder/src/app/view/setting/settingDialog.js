import React from 'react';
import UpdateStateAction from '../share/updateStateAction.js';
import Chromer from '../../chromer.js';

const settingKey = 'setting';
const eventConfigKey = 'eventConfig';

const closeDialog = () => {
    UpdateStateAction.next({
        key: 'toShowSettingDialog',
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
    var formData,
        key,
        settings,
        attrsConfig = {},
        eventConfig;

    evt.preventDefault();
    formData = new FormData(evt.target);
    settings = formData.get(settingKey);
    eventConfig = formData.get(eventConfigKey);

    if (settings) {
        settings = JSON.parse(settings);
    }

    if (eventConfig) {
        settings.eventConfig = JSON.parse(eventConfig);
    }

    if (Object.keys(settings).length) {
        Chromer.sendMessage({
            action: 'updateconfig',
            value: settings
        });
    }

    localStorage.setItem('settings', JSON.stringify(settings));
    UpdateStateAction.next({
        key: 'settings',
        value: settings
    });
    
    closeDialog();
};

const SettingDialog = ({appState}) => {
    var localSetting = localStorage.getItem('settings'),
        settingConfig = localSetting ? JSON.parse(localSetting) : appState.settings,
        settingStr = (settingConfig && JSON.stringify(settingConfig, null, 4)) || '';

    return (
        <div tabIndex="0" className={appState.toShowSettingDialog ? "i-dialog" : "i-dialog i-hidden"} onKeyDown={onDialogKeyDown}>
            <div className="i-dialog-content">
                <div className="i-dialog-header">
                    <div className="i-dialog-title">Settings</div>
                    <div className="i-dialog-close" onClick={onDialogCloseClick}>&#10006;</div>
                </div>
                <form onSubmit={(evt) => handleSumbit(evt, appState)}>
                    <div className="i-dialog-content-center">
                        <div className='i-dialog-table'>
                            <div className="i-dialog-row">
                                <div className='i-dialog-column i-dialog-label'>
                                    Config
                                </div>
                                <div className='i-dialog-column'>
                                    <textarea name={settingKey} defaultValue={settingStr} ref={(i) => i && i.focus()} cols="50" rows="30"/>
                                </div>
                            </div>
                            <div className="i-dialog-row i-hidden">
                                <div className='i-dialog-column i-dialog-label'>
                                    Events
                                </div>
                                <div className='i-dialog-column'>
                                    <textarea name={eventConfigKey} cols="50" rows="10"/>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="i-dialog-footer">
                        <button type='submit'>OK</button>
                        <button onClick={oncCancelClick}>Cancel</button>
                    </div>
                </form>            
            </div>
        </div>
    );
};

export default SettingDialog;