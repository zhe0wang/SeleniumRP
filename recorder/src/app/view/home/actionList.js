import React from 'react';
import Pager from '../share/pager.js';
import RemoveClientEventAction from './removeClientEventAction.js';
import Chromer from '../../chromer.js';

const highlightElement = (cssPath) => Chromer.sendMessage({action : 'highlight', value: cssPath});

const ActionList = ({appState}) => {
    var selectedStep = appState.selectedStep,
        results, 
        rowsToShow = 10, 
        pageNo = appState.actionListPageNo || 1,
        totalPage,
        startRow = (pageNo - 1) * rowsToShow,
        endRow = pageNo * rowsToShow,
        filters = appState.eventsFilter.split(' ').filter((keyword) => keyword && keyword.trim()),
        filteredRows,
        filteredTotal,
        toShowDetail = appState.toShowEventDetail,
        i,
        rows = [],
        rowsLen,
        className = 'i-event-table' + (selectedStep ? ' i-event-selected-step' : '');

    results = selectedStep ? appState.savedSteps[selectedStep].actions : appState.clientActions;
    results = results  || [];
    filteredRows = (!filters || !filters.length) ? results : results.filter((row) => {
        var evtStr = JSON.stringify(row);
        return evtStr && filters.some((filter) => evtStr.indexOf(filter) > -1);
    });
    filteredTotal = filteredRows.length;
    totalPage = Math.ceil(filteredTotal / rowsToShow) || 1,
    pageNo = Math.max(Math.min(totalPage, pageNo), 1);
    startRow = (pageNo - 1) * rowsToShow;
    endRow = pageNo * rowsToShow;

    for (i = filteredRows.length - 1, rowsLen = 0; i >= 0 && rowsLen <= endRow; i -= 1) {
        if (rowsLen >= startRow) {
            rows.push(filteredRows[i]);
        }

        rowsLen += 1;
    }

    return (
        <div>
            <div className = 'i-event-table-wrapper'>
                <div className={className}>
                    {rows.map((row) =>
                    {
                        var cssPath = row.cssPath;
                        var rowTitle = row.type + (cssPath ? ' - ' + cssPath : '');
                        return (<div className='i-event-row' key={row.id} onClick={() => {highlightElement(cssPath)}}>
                                    <div className='i-event-item-remove' onClick={() => { RemoveClientEventAction.next(row.id) } }>&#10006;</div>
                                    {!toShowDetail ? <div className='i-event-item truncate-200' title ={rowTitle}>{rowTitle}</div> : <div className='i-event-item'>{JSON.stringify(row, null, 2)}</div>}
                                </div>);
                    })}
                </div>
            </div>
            <Pager appState={appState} pageNoKey={'actionListPageNo'} total={filteredRows.length} pageSize={rowsToShow}/>
        </div>
    );
};

export default ActionList;