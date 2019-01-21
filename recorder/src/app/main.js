import React from 'react';
import {render} from 'react-dom';
import AppStore from './appStore.js';
import Routes from './routes.js';
import Chromer from './chromer.js';
import UpdateStateAction from './view/share/updateStateAction';

function loadSettings() {
    var localSetting = localStorage.getItem('settings');
    if (localSetting) {
        var settings = JSON.parse(localSetting);
        UpdateStateAction.next({
            key: 'settings',
            value: settings
        });
    }
}

const renderApp = (appState) => {    
    const createElement = (Cmp, props) => {
        return <Cmp appState={appState} {...props}/>;
    };
    
    render(<Routes createElement={createElement}/>, document.getElementById('app'));    
};

AppStore.updater.subscribe(renderApp);
AppStore.start();

Chromer.start();
loadSettings();