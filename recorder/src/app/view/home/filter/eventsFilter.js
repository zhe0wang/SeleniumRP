import React from 'react';
import UpdateStateAction from '../../share/updateStateAction.js';

const updateState = (key, value) => UpdateStateAction.next({key: key, value: value});
const setFilter = (filter) => updateState('eventsFilter', filter);
const showEventDetail = (toShow) => updateState('toShowEventDetail', toShow);

const EventsFilter = ({appState}) => (
    <div className='i-event-filter-table'>
        <div className='i-event-filter-column'>
            Details
        </div>
        <div className='i-event-filter-column'>
            <input type="checkbox" className='i-event-show-detail' defaultChecked={appState.toShowEventDetail} onChange={(evt) =>showEventDetail(evt.target.checked)}></input>
        </div>
        <div className='i-event-filter-column'>
            Filter&nbsp;
        </div>
        <div className='i-event-filter-column'>
            <input className='i-event-filter-input' type='text' value={appState.eventsFilter} onChange={(evt) =>setFilter(evt.target.value)}></input>
        </div>
    </div>
);

export default EventsFilter;