import React from 'react';
import { Router, Route, IndexRoute, Link, hashHistory } from 'react-router';
import App from './view/app.js';
import Home from './view/home/home.js';

const routes = (
        <Route path="/" component={App}>
            <IndexRoute component={Home}/>
        </Route>
);

const Routes = ({createElement}) => (
    <Router history={hashHistory} createElement={createElement}>
        {routes}
    </Router>
);

export default Routes;

