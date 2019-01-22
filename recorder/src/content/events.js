(function () {
    var automEvents = window.automEvents,
        events = automEvents.eventConfig,
        setting,
        attrsConfig,
        attrs,
        commands = {
            sceenshot: {
                keys: []
            },
            verifytarget: {
                keys: []
            }
        },
        attrBuilderMap = {
            'id': buildIdPath,
            'tagName': buildTagPath,
            'classList': buildClassPath
        },
        eventCb,
        recording,
        selectingType = null,
        isScreenshot,
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

    function initAttrs(attrsConfig) {
        attrs = [];
        if (!attrsConfig) {
            return;
        }
        
        Object.keys(attrsConfig).forEach((key) => {
            if (attrsConfig[key] && attrsConfig[key].enabled) {
                attrs.push(key);
            }
        });
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
        console.log('update config: ' + JSON.stringify(config));
        setting = config;
        if (config.selectorConfig && config.selectorConfig.attrsConfig) {
            attrsConfig = config.selectorConfig.attrsConfig;
            initAttrs(attrsConfig);
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
        var eventMessage;

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
        var overLay;

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
            el.style.position = 'fixed';
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
            target = getEventTarget(evt.target),
            targetValue;

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
        eventTarget.cssPath = getCssPath(target);

        return eventTarget;
    }

    function addProp(source, key, dest) {
        var value = source[key];
        if (value && value.length) {
            dest[key] = value;
        }
    }

    function getCssPath(target) {
        var currentTarget = target,
            currentCssPath = buildCssPath(currentTarget),
            cssPath,
            els,
            nth,
            parent,
            isUnique;

        if (isUniqueSelector(currentCssPath)) {
            return currentCssPath;
        }

        parent = currentTarget.parentNode;            
        while (!isUnique && parent !== null) {
            els = parent.querySelectorAll(currentCssPath);
            if (els.length > 1) {
                nth = Array.prototype.indexOf.call(els, currentTarget);
                if (nth > -1) {
                    currentCssPath += ':nth-child(' + (nth + 1) + ')';
                }
            }
            
            if (currentCssPath !== cssPath) {
                cssPath = cssPath ? currentCssPath + ' ' + cssPath : currentCssPath;
            }
            currentTarget = parent;            
            currentCssPath = buildCssPath(currentTarget);
            isUnique = isUniqueSelector(cssPath);
            parent = currentTarget.parentNode;
        }

        return cssPath;
    }

    function buildCssPath(target) {
        var cssPath = '',
            pathBuilder,
            attr,
            attrConfig,
            attrValue,
            matchValues,
            i,
            len = attrs.length;

        for (i = 0; i < len; i += 1) {
            attr = attrs[i];
            attrValue = target[attr];
            if (!attrValue) {
                continue;
            }
            
            attrConfig = attrsConfig[attr];
            pathBuilder = attrBuilderMap[attr];
            if (pathBuilder) {
                cssPath = pathBuilder(target, cssPath, attrConfig);    
            } else {
                matchValues = matches(attrConfig, [attrValue]);
                if (matchValues.length) {
                    cssPath += '[' + attr + '="' + matchValues[0] +'"]';
                }
            }

            if (isUniqueSelector(cssPath)) {
                return cssPath;
            }
        }

        return cssPath;
    }

    function matches(config, values) {
        var resultMap = {},
            includeRegex,
            excludeRegex;

        if (!config) {
            return [];
        }

        if (!config.include && !config.exclude) {
            return values;
        }

        includeRegex = config.include ? new RegExp(config.include) : null;
        excludeRegex = config.exclude ? new RegExp(config.exclude) : null;
        values.forEach(function(value) {
            if (value && (!includeRegex || includeRegex.test(value)) && (!excludeRegex || !excludeRegex.test(value))) {
                resultMap[value] = 1;
            }
        });

        return Object.keys(resultMap);
    }

    function buildIdPath(target, cssPath, attrConfig) {
        var id = target.id,
            matchValues = matches(attrConfig, [id]);
        if (!matchValues.length) {
            return cssPath;
        }

        return cssPath + '#' + matchValues[0];
    }

    function buildTagPath(target, cssPath, attrConfig) {
        var tagName = target.tagName,
            matchValues = matches(attrConfig, [tagName]);
        if (!matchValues.length) {
            return cssPath;
        }

        return matchValues[0] + cssPath;
    }
    
    function buildClassPath (target, cssPath, attrConfig) {
        var matchValues = matches(attrConfig, Array.prototype.slice.call(target.classList));
        if (!matchValues.length) {
            return cssPath;            
        }

        matchValues.forEach((css) => {
            cssPath += '.' + css;
            if (isUniqueSelector(cssPath)) {
                return cssPath;
            }
        });

        return cssPath;
    }    

    function isUniqueSelector(cssPath, parent) {
        if (!cssPath) {
            return false;
        }

        parent = parent || window.document;
        return window.document.querySelectorAll(cssPath).length === 1;
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