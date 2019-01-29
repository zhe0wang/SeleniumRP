(function () {
    var events = {
        mouseenter: {
            condition: function (evt) {
                return false;
            }
        },
        dblclick: {
            condition: function (evt) {
                return !(evt.clientX === 0 && evt.clientY === 0 && evt.detail === 0);
            }
        },
        click: {
            condition: function (evt) {
                return !(evt.clientX === 0 && evt.clientY === 0 && evt.detail === 0 && evt.target && evt.target.tagName.toUpperCase() !== 'SELECT');
            }
        },
        keydown: {
            props: [{
                name: 'value',
                fn: function (evt) {
                    return evt.keyCode;
                }
            }],
            condition: function (evt) {
                return evt.keyCode === 8 || evt.keyCode === 46 || evt.keyCode === 13;
            }
        },
        keypress: {
            props: [{
                name: 'value',
                fn: function (evt) {
                    return evt.keyCode;
                }
            }],
            condition: function (evt) {
                return !isTextInput(evt.target);
            }
        },
        keyup: {
            props: [{
                name: 'value',
                fn: function (evt) {
                    return evt.target.value;
                }
            }],
            condition: function (evt) {
                return isTextInput(evt.target) && evt.keyCode !== 13;
            }
        },
        scroll: {
            props: [{
                name: 'left',
                fn: function (evt) {
                    return evt.target.parentElement ? evt.target.scrollLeft : window.pageXOffset;
                }
            }, {
                name: 'top',
                fn: function (evt) {
                    return evt.target.parentElement ? evt.target.scrollTop : window.pageYOffset;
                }
            }]
        },
        contextmenu: {}
    };

    function isTextInput(target) {
        var tagName = target && target.tagName && target.tagName.toUpperCase();
        if (!tagName) {
            return false;
        }
        return tagName === 'TEXTAREA' || tagName === 'INPUT';
    }

    window.automEvents = window.automEvents || {};
    window.automEvents.eventConfig = events;
})();