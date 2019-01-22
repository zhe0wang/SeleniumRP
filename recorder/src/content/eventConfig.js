(function () {
    var isTextInput = function (target) {
        var tagName = target && target.tagName && target.tagName.toUpperCase();
        if (!tagName) {
            return false;
        }
        return tagName === 'TEXTAREA' || tagName === 'INPUT';
    },
        events = {
            mouseenter: {
                condition: function (evt) {
                    return false;
                }
            },
            dblclick: {
                props: ['altKey', 'button', 'buttons', 'clientX', 'clientY', 'ctrlKey', 'shiftKey', 'which'],
                condition: function (evt) {
                    return !(evt.clientX === 0 && evt.clientY === 0 && evt.detail === 0);
                }
            },
            click: {
                props: ['altKey', 'button', 'buttons', 'clientX', 'clientY', 'ctrlKey', 'shiftKey', 'which'],
                condition: function (evt) {
                    return !(evt.clientX === 0 && evt.clientY === 0 && evt.detail === 0 && evt.target && evt.target.tagName.toUpperCase() !== 'SELECT');
                }
            },
            keydown: {
                props: ['key', 'keyCode', 'char', 'charCode', 'location', 'ctrlKey', 'shiftKey', 'altKey', 'metaKey'],
                condition: function (evt) {
                    return evt.keyCode === 8 || evt.keyCode === 46 || evt.keyCode === 13;
                }
            },
            keypress: {
                props: ['key', 'keyCode', , 'location', 'ctrlKey', 'shiftKey', 'altKey', 'metaKey'],
                condition: function (evt) {
                    return !isTextInput(evt.target);
                }
            },
            keyup: {
                props: ['key', 'keyCode', 'char', 'charCode', 'location', 'ctrlKey', 'shiftKey', 'altKey', 'metaKey'],
                condition: function (evt) {
                    return isTextInput(evt.target) && evt.keyCode !== 13;
                }
            },
            scroll: {
                props: ['detail', {
                    name: 'scroll', fn: function scroll(evt) {
                        var target = evt.target,
                            noParent = !target.parentElement,
                            scrollLeft = !noParent ? target.scrollLeft : window.pageXOffset,
                            scrollTop = !noParent ? target.scrollTop : window.pageYOffset;

                        return { left: scrollLeft, top: scrollTop };
                    }
                }]
            },
            contextmenu: {
                props: ['altKey', 'button', 'buttons', 'clientX', 'clientY', 'ctrlKey', 'shiftKey', 'which']
            }
            // wheel: {
            //     props: ['deltaX ', 'deltaY', 'deltaZ', 'deltaMode', 'altKey', 'button', 'buttons', 'clientX', 'clientY', 'ctrlKey', 'shiftKey', 'which']
            // }
            // mousedown: {
            //     props: ['altKey', 'button', 'buttons', 'clientX', 'clientY', 'ctrlKey', 'shiftKey', 'which']
            // },
            // mousemove: {
            //     props: ['altKey', 'button', 'buttons', 'clientX', 'clientY', 'ctrlKey', 'shiftKey', 'which']
            // },
            // mouseup: {
            //     props: ['altKey', 'button', 'buttons', 'clientX', 'clientY', 'ctrlKey', 'shiftKey', 'which']
            // }
        };

    window.automEvents = window.automEvents || {};
    window.automEvents.eventConfig = events;
})();