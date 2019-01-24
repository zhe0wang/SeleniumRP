(function () {
    var automEvents = window.automEvents,
        events = automEvents.eventConfig,
        attrs,
        eventCb,
        recording,
        selectingType = null,
        selectTargetOverlay,
        regionStart,
        isMouseDown = false,
        eventModule,
        previousTime,
        updateStateHandler;

    function startListening(cb) {
        eventCb = cb;

        Object.keys(events).forEach(function (event) {
            var eventConfig = events[event];
            window.addEventListener(event, onEvent, true);
        });

        window.addEventListener('mousemove', onSelectingMouseOver, true);
        window.addEventListener('mousedown', onSelectingMouseDown, true);
        window.addEventListener('mouseup', onSelectingMouseUp, true);
        window.addEventListener('click', onSelectingClick, true);
    }

    function toggleRecording(toStart) {
        recording = toStart;
    }

    function setSelectingType(type) {
        selectingType = recording && type || null;
        if (!selectingType) {
            hideSelectingOverlay();
        }
    }

    function setUpdateStateHandler(handler) {
        updateStateHandler = handler;
    }

    function updateState(config) {
        if (updateStateHandler) {
            updateStateHandler(config);
        }
    }

    function updateConfig(config) {
        var attrsConfig;
        console.log('update config: ' + JSON.stringify(config));
        if (config.selectorConfig && config.selectorConfig.attrsConfig) {
            attrsConfig = config.selectorConfig.attrsConfig;
            attrs = [];            
            Object.keys(attrsConfig).forEach((key) => {
                if (attrsConfig[key] && attrsConfig[key].enabled) {
                    attrs.push(key);
                }
            });
            
            window.automEvents.cssPathBuilder.updateAttrsConfig(attrsConfig, attrs);
        }
    }

    function isInRange(evt) {
        var evtX = evt.clientX,
            evtY = evt.clientY;

        return evtX >= 1 && evtY >= 1 && evtX <= (window.innerWidth - 1) && evtY <= (window.innerHeight - 1);
    }

    function onSelectingMouseOver(evt) {
        var overLay,
            target,
            position,
            targetBox,
            size,
            borderColor,
            evtX = evt.clientX,
            evtY = evt.clientY;

        if (!selectingType || !isInRange(evt)) {
            return;
        } 

        overLay = getSelectingOverlay();        
        if (selectingType === 'target') {
            target = evt.target;
            targetBox = target.getBoundingClientRect();
            position = getPosition(target);
            size = {
                x: position.x,
                y: position.y,
                width: targetBox.width,
                height: targetBox.height
            }
            
            overLay.style.border = '2px solid #FF5733';
            overLay.style.position  = 'absolute';
        } else {
            if (isMouseDown && regionStart){
                size = {
                    x: Math.min(regionStart.x, evtX) - 1,
                    y: Math.min(regionStart.y, evtY) - 1,
                    width: Math.abs(regionStart.x - evtX) + 2,
                    height: Math.abs(regionStart.y - evtY) + 2
                }
            } else {
                size = {
                    x: evtX - 1,
                    y: evtY - 1,
                    width: 2,
                    height: 2
                }
            }
            
            overLay.style.position  = 'fixed';
            overLay.style.borderTop = size.y + 'px solid';
            overLay.style.borderLeft = size.x + 'px solid';
            overLay.style.borderRight = (window.innerWidth - size.x - size.width) + 'px solid';            
            overLay.style.borderBottom = (window.innerHeight - size.y - size.height) + 'px solid';
            overLay.style.borderColor = 'rgba(0, 0, 0, 0.7)';

            size.x = document.body.scrollLeft;
            size.y = document.body.scrollTop;
        }

        overLay.style.top = size.y + 'px';
        overLay.style.left = size.x + 'px';
        overLay.style.width = size.width + 'px';
        overLay.style.height = size.height + 'px';
        overLay.style.display = 'block';
    }

    function onSelectingMouseDown(evt) {
        var overLay,
            eventMessage;

        if (!selectingType || !isInRange(evt)) {
            return;
        }

        if (selectingType === 'target') {
            hideSelectingOverlay();
            eventMessage = getVerifyTargetMessage(evt);
            if (eventMessage) {
                sendEventMessage({
                    target: evt.target,
                    message: eventMessage
                });
            }
            updateState({key: 'selectingType', value: null});                
        } else {
            isMouseDown = true;
            regionStart = {x: evt.clientX, y: evt.clientY};
        }

        evt.stopPropagation();
        evt.preventDefault();
    }

    function onSelectingMouseUp(evt) {
        if (!selectingType || !isInRange(evt)) {
            return;
        } 

        if (Math.abs(regionStart.x - evt.clientX) > 2 && Math.abs(regionStart.y - evt.clientY) > 2) {
            sendEventMessage({
                message: {
                    type: 'screenshot',
                    x: Math.min(regionStart.x, evt.clientX) - 1,
                    y: Math.min(regionStart.y, evt.clientY) - 1,                    
                    width: Math.abs(regionStart.x - evt.clientX) + 2,
                    height: Math.abs(regionStart.y - evt.clientY) + 2
                }
            });
        }

        isMouseDown = false;
        regionStart = null;
    }

    function onSelectingClick(evt) {
        if (!selectingType) {
            return;
        }

        evt.stopPropagation();
        evt.preventDefault();

        hideSelectingOverlay();
        selectingType = null;
        updateState({key: 'selectingType', value: null});             
    }

    function highlightElement(cssPath) {
        var target = document.querySelector(cssPath);
        if (!target) {
            return;
        }

        var overLay = getSelectingOverlay();
        var targetBox = target.getBoundingClientRect();
        var position = getPosition(target);
        var size = {
                x: position.x,
                y: position.y,
                width: targetBox.width,
                height: targetBox.height
            };
            
        overLay.style.border = '2px solid #FF5733';
        overLay.style.top = size.y + 'px';
        overLay.style.left = size.x + 'px';
        overLay.style.width = size.width + 'px';
        overLay.style.height = size.height + 'px';
        overLay.style.display = 'block';

        setTimeout(() => {
            hideSelectingOverlay();
            selectingType = null;
            updateState({key: 'selectingType', value: null}); 
        }, 2000);  
    }

    function hideSelectingOverlay() {
        var overLay = getSelectingOverlay();
        overLay.style.display = 'none';
    }

    function getSelectingOverlay() {
        var el;

        if (!selectTargetOverlay) {
            el = window.document.createElement('div');
            el.id = 'autom-select-target-overlay';
            el.style.display = 'none';
            el.style.position = 'absolute';
            el.style.width = '100px';
            el.style.border = '2px solid #FF5733';
            el.style.height = '100px';
            el.style.background = 'transparent';
            el.style['pointer-events'] = 'none';
            el.style['z-index'] = 100000;
            el.style['box-sizing'] = 'content-box';
            document.body.appendChild(el);
            selectTargetOverlay = el;
        }

        return selectTargetOverlay;
    }

    function onEvent(evt) {
        var eventMessage;

        if (!recording || !eventCb || selectingType) {
            return;
        }

        console.log(evt.type);
        eventMessage = getEventMessage(evt);
        if (eventMessage) {
            sendEventMessage({
                target: evt.target,
                message: eventMessage
            });
        }
    }

    function sendEventMessage (eventMessage) {        
        eventCb(eventMessage.message);
    } 

    function getVerifyTargetMessage(evt) {
        var type = 'verify',
            target = getEventTarget(evt.target, true);

        return {
            type: type,
            timeDiff: getTimeDiff(),
            target: target
        };
    }

    function getEventMessage(evt) {
        var type = evt.type,
            message = { type: type },
            eventConfig = events[type],
            target = getEventTarget(evt.target);

        if (eventConfig) {
            if (eventConfig.condition && !eventConfig.condition(evt)) {
                return;
            }

            eventConfig.props.forEach(function (prop) {
                var isPropFunc = prop.name && prop.fn,
                    propName = isPropFunc ? prop.name : prop,
                    propValue = isPropFunc ? prop.fn(evt) : evt[prop];

                if (propValue !== undefined) {
                    message[propName] = propValue;
                }
            });
        }

        if (target) {
            message.target = target;
        }

        message.timeDiff = getTimeDiff();
        return message;
    }

    function getTimeDiff() {
        var diff = 0;

        if (!previousTime) {
            previousTime = new Date().getTime();
        } else {
            diff = new Date().getTime() - previousTime;
            previousTime += diff;
        }

        return diff;
    }

    function getEventTarget(target, includeText) {
        var props = attrs.concat(['textContent', 'value']),
            eventTarget = {};

        if (!target) {
            return null;
        }

        if (target === document) {
            eventTarget.cssPath = 'body';
            return eventTarget;
        }

        props.forEach(function (prop) {
            addProp(target, prop, eventTarget);
        });

        if (eventTarget.textContent) {
            eventTarget.textContent = eventTarget.textContent.replace(/\r|\n/g, '').substring(0, 100);
        }

        eventTarget.position = getPosition(target);
        eventTarget.cssPath = window.automEvents.cssPathBuilder.builderCssPath(target);

        return eventTarget;
    }

    function addProp(source, key, dest) {
        var value = source[key];
        if (value && value.length) {
            dest[key] = value;
        }
    }

   
    function getPosition(el) {
        var elPosition = el.getBoundingClientRect && el.getBoundingClientRect();

        return !elPosition ? { x: 0, y: 0 } : {
            x: elPosition.left + window.scrollX,
            y: elPosition.top + window.scrollY,
            width: elPosition.width,
            height: elPosition.height
        }
    }

    eventModule = {
        events: events,
        startListening: startListening,
        toggleRecording: toggleRecording,
        setSelectingType: setSelectingType,
        highlightElement: highlightElement,
        updateConfig: updateConfig,
        setUpdateStateHandler: setUpdateStateHandler
    }

    window.automEvents = Object.assign(window.automEvents || {}, eventModule);
})();