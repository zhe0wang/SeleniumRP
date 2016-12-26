import React from 'react';
import {render} from 'react-dom';
import AppStore from './appStore.js';
import Routes from './routes.js';
import Chromer from './chromer.js';

const renderApp = (appState) => {    
    const createElement = (Cmp, props) => {
        return <Cmp appState={appState} {...props}/>;
    };
    
    render(<Routes createElement={createElement}/>, document.getElementById('app'));    
};

AppStore.updater.subscribe(renderApp);
AppStore.start();

Chromer.start();