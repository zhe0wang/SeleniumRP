import React from 'react';
import UpdateStateAction from './updateStateAction.js';

const Pager = ({appState, pageNoKey, total, pageSize}) => {
    var totalPage = Math.ceil(total / pageSize) || 1,
        pageNo = appState[pageNoKey];

    const changePage = (pageNoRaw, totalPage, pageNoKey) => {   
        pageNo = pageNoRaw ? parseInt(pageNoRaw, 10) : 1;
        pageNo = Math.max(Math.min(totalPage, pageNo), 1);
        UpdateStateAction.next({key: pageNoKey, value: pageNo});
    };

    const onBlur = (evt) => {
         changePage(evt.target.value, totalPage, pageNoKey);
         evt.target.value = pageNo;
    };

    const onKeyPress = (evt) => {
        if (evt.key !== 'Enter') {
            return;
        }

        changePage(evt.target.value, totalPage, pageNoKey);
        evt.target.value = pageNo;
    };

    const goBack = (evt) => {
        changePage(pageNo - 1, totalPage, pageNoKey)
    }

    const goNext = (evt) => {
        changePage(pageNo + 1, totalPage, pageNoKey)
    }

    pageNo = pageNo || 1;
    pageNo = Math.max(Math.min(totalPage, pageNo), 1);

    // <input type="number" min="1" max={totalPage} defaultValue={pageNo} onBlur={onBlur} onKeyPress={onKeyPress}></input> / <span>{totalPage}</span>
    return (
        <div className='i-pager'>
            <button onClick={goBack}>&lt;</button>
            <div className='i-pager-page-no'>
                <span>{pageNo}</span> / <span>{totalPage}</span>
            </div>
            <button onClick={goNext}>&gt;</button>
        </div>
    );
};

export default Pager;