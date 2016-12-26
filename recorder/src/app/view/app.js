import React from 'react';
import {RouteHandler}  from 'react-router';
import './app.scss';
import Header from './share/header.js';
import Footer from './share/footer.js';

const App = ({appState, children}) => (
    <div>
        <Header/>
        {children}
        <Footer/>
    </div>
);
export default App;