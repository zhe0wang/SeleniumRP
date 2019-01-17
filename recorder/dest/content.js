/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmory imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmory exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		Object.defineProperty(exports, name, {
/******/ 			configurable: false,
/******/ 			enumerable: true,
/******/ 			get: getter
/******/ 		});
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 368);
/******/ })
/************************************************************************/
/******/ ({

/***/ 17:
/***/ function(module, exports) {

module.exports = function (exec) {
  try {
    return !!exec();
  } catch (e) {
    return true;
  }
};


/***/ },

/***/ 188:
/***/ function(module, exports) {

"use strict";
'use strict';

(function () {
    var state = {
        recording: false
    },
        actions = {
        start: startAction,
        stop: stopAction,
        selecttarget: selectTargetAction,
        updateconfig: updateConfig,
        updatestate: updateState,
        screenshot: screenshot
    },
        channel;

    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        var action = actions[request.action],
            success = false;

        if (action) {
            action(request.value);
            success = true;
        }
        sendResponse({ success: true });
    });

    function startAction() {
        window.location.reload();
    }

    function stopAction() {
        state.recording = false;
        window.automEvents.toggleRecording(state.recording);
        closeChannel();
    }

    function updateState(config) {
        state[config.key] = config.value;
        if (config.key === 'isPartialScreenshot' && !config.value && state.selectingType === 'region') {
            screenshot();
        }
    }

    function screenshot() {
        state.selectingType = state.isPartialScreenshot && state.selectingType !== 'region' ? 'region' : null;
        window.automEvents.setSelectingType(state.selectingType);
    }

    function selectTargetAction() {
        state.selectingType = state.selectingType !== 'target' ? 'target' : null;
        window.automEvents.setSelectingType(state.selectingType);
    }

    function updateConfig(config) {
        window.automEvents.updateConfig(config);
    }

    function start() {
        window.automEvents.startListening(eventCallBack);
        window.automEvents.setUpdateStateHandler(updateState);
        window.addEventListener('unload', onUnLoad);

        chrome.runtime.sendMessage({ action: 'isRecording' }, function (response) {
            state.recording = response && response.isRecording;
            if (state.recording) {
                window.automEvents.toggleRecording(state.recording);
                createChannel();

                if (window.self === window.top) {
                    sendMessage({
                        notify: 'load'
                    });
                    sendMessage({
                        type: 'setsize',
                        sizes: {
                            width: window.innerWidth,
                            height: window.innerHeight
                        }
                    });
                    sendMessage({
                        type: 'url',
                        url: window.location.href
                    });
                }
            }
        });
    }

    function onUnLoad() {
        if (!state.recording) {
            return true;
        }

        channel.postMessage({ stopRecording: true });
    }
    function createChannel() {
        channel = chrome.runtime.connect({ name: "automrecoder" });

        channel.onMessage.addListener(handlChannelMessage);
    }

    function handlChannelMessage(message) {}

    function closeChannel() {
        channel.disconnect();
    }

    function eventCallBack(eventMessage) {
        sendMessage(eventMessage);
    }

    function sendMessage(message) {
        if (!state.recording) {
            return;
        }

        channel.postMessage(message);
    }

    start();
})();

/***/ },

/***/ 189:
/***/ function(module, exports) {

"use strict";
'use strict';

(function () {
    var isTextInput = function isTextInput(target) {
        var tagName = target && target.tagName && target.tagName.toUpperCase();
        if (!tagName) {
            return false;
        }
        return tagName === 'TEXTAREA' || tagName === 'INPUT';
    },
        events = {
        mouseenter: {
            condition: function condition(evt) {
                return false;
            }
        },
        dblclick: {
            props: ['altKey', 'button', 'buttons', 'clientX', 'clientY', 'ctrlKey', 'shiftKey', 'which'],
            condition: function condition(evt) {
                return !(evt.clientX === 0 && evt.clientY === 0 && evt.detail === 0);
            }
        },
        click: {
            props: ['altKey', 'button', 'buttons', 'clientX', 'clientY', 'ctrlKey', 'shiftKey', 'which'],
            condition: function condition(evt) {
                return !(evt.clientX === 0 && evt.clientY === 0 && evt.detail === 0 && evt.target && evt.target.tagName.toUpperCase() !== 'SELECT');
            }
        },
        keydown: {
            props: ['key', 'keyCode', 'char', 'charCode', 'location', 'ctrlKey', 'shiftKey', 'altKey', 'metaKey'],
            condition: function condition(evt) {
                return evt.keyCode === 8 || evt.keyCode === 46 || evt.keyCode === 13;
            }
        },
        keypress: {
            props: ['key', 'keyCode',, 'location', 'ctrlKey', 'shiftKey', 'altKey', 'metaKey'],
            condition: function condition(evt) {
                return !isTextInput(evt.target);
            }
        },
        keyup: {
            props: ['key', 'keyCode', 'char', 'charCode', 'location', 'ctrlKey', 'shiftKey', 'altKey', 'metaKey'],
            condition: function condition(evt) {
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
        } },
        selectorConfig = {
        attrsConfig: {
            id: true,
            classList: true,
            tagName: true,
            target: true,
            name: true,
            type: true
        },
        uniqueCssPath: true
    };

    window.automEvents = window.automEvents || {};
    window.automEvents.eventConfig = events;
    window.automEvents.selectorConfig = selectorConfig;
})();

/***/ },

/***/ 190:
/***/ function(module, exports, __webpack_require__) {

"use strict";
'use strict';

var _assign = __webpack_require__(33);

var _assign2 = _interopRequireDefault(_assign);

var _stringify = __webpack_require__(32);

var _stringify2 = _interopRequireDefault(_stringify);

var _keys = __webpack_require__(34);

var _keys2 = _interopRequireDefault(_keys);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(function () {
    var automEvents = window.automEvents,
        events = automEvents.eventConfig,
        attrsConfig = automEvents.selectorConfig.attrsConfig,
        attrs,
        uniqueCssPath = automEvents.selectorConfig.uniqueCssPath,
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
        initAttrs();

        (0, _keys2.default)(events).forEach(function (event) {
            var eventConfig = events[event];
            window.addEventListener(event, onEvent, true);
        });

        window.addEventListener('mousemove', onSelectingMouseOver, true);
        window.addEventListener('mousedown', onSelectingMouseDown, true);
        window.addEventListener('mouseup', onSelectingMouseUp, true);
        window.addEventListener('click', onSelectingClick, true);
    }

    function initAttrs() {
        attrs = [];
        (0, _keys2.default)(attrsConfig).forEach(function (key) {
            if (attrsConfig[key]) {
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
        console.log('update config: ' + (0, _stringify2.default)(config));
        if (config.selectorConfig && config.selectorConfig.attrsConfig) {
            attrsConfig = config.selectorConfig.attrsConfig;
            initAttrs();
        }

        if (config.selectorConfig && config.selectorConfig.uniqueCssPath !== undefined) {
            uniqueCssPath = config.selectorConfig.uniqueCssPath;
        }
    }

    function isInRange(evt) {
        var evtX = evt.clientX,
            evtY = evt.clientY;

        return evtX >= 1 && evtY >= 1 && evtX <= window.innerWidth - 1 && evtY <= window.innerHeight - 1;
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
            };

            overLay.style.border = '2px solid #FF5733';
        } else {
            if (isMouseDown && regionStart) {
                size = {
                    x: Math.min(regionStart.x, evtX) - 1,
                    y: Math.min(regionStart.y, evtY) - 1,
                    width: Math.abs(regionStart.x - evtX) + 2,
                    height: Math.abs(regionStart.y - evtY) + 2
                };
            } else {
                size = {
                    x: evtX - 1,
                    y: evtY - 1,
                    width: 2,
                    height: 2
                };
            }

            overLay.style.borderTop = size.y + 'px solid';
            overLay.style.borderLeft = size.x + 'px solid';
            overLay.style.borderRight = window.innerWidth - size.x - size.width + 'px solid';
            overLay.style.borderBottom = window.innerHeight - size.y - size.height + 'px solid';
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
        var overLay, eventMessage;

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
            updateState({ key: 'selectingType', value: null });
        } else {
            isMouseDown = true;
            regionStart = { x: evt.clientX, y: evt.clientY };
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
        updateState({ key: 'selectingType', value: null });
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

    function sendEventMessage(eventMessage) {
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
        var props = attrs.concat(['id', 'classList', 'tagName', 'textContent', 'value']),
            eventTarget = {
            cssPath: ''
        },
            cssPath,
            position;

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
        cssPath = getCssPath(target);
        if (cssPath) {
            eventTarget.cssPath = cssPath;
        }

        return eventTarget;
    }

    function addProp(source, key, dest, destKey) {
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

        if (!uniqueCssPath || isUniqueSelector(currentCssPath)) {
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
                    cssPath += '[' + attr + '="' + matchValues[0] + '"]';
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
        values.forEach(function (value) {
            if (value && (!includeRegex || includeRegex.test(value)) && (!excludeRegex || !excludeRegex.test(value))) {
                resultMap[value] = 1;
            }
        });

        return (0, _keys2.default)(resultMap);
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

    function buildClassPath(target, cssPath, attrConfig) {
        var matchValues = matches(attrConfig, Array.prototype.slice.call(target.classList));
        if (!matchValues.length) {
            return cssPath;
        }

        return cssPath + '.' + matchValues.join('.');
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
        };
    }

    eventModule = {
        events: events,
        startListening: startListening,
        toggleRecording: toggleRecording,
        setSelectingType: setSelectingType,
        updateConfig: updateConfig,
        setUpdateStateHandler: setUpdateStateHandler
    };

    window.automEvents = (0, _assign2.default)(window.automEvents || {}, eventModule);
})();

/***/ },

/***/ 23:
/***/ function(module, exports, __webpack_require__) {

// Thank's IE8 for his funny defineProperty
module.exports = !__webpack_require__(17)(function () {
  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
});


/***/ },

/***/ 26:
/***/ function(module, exports) {

// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self
  // eslint-disable-next-line no-new-func
  : Function('return this')();
if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef


/***/ },

/***/ 27:
/***/ function(module, exports) {

module.exports = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};


/***/ },

/***/ 32:
/***/ function(module, exports, __webpack_require__) {

module.exports = { "default": __webpack_require__(69), __esModule: true };

/***/ },

/***/ 33:
/***/ function(module, exports, __webpack_require__) {

module.exports = { "default": __webpack_require__(70), __esModule: true };

/***/ },

/***/ 34:
/***/ function(module, exports, __webpack_require__) {

module.exports = { "default": __webpack_require__(71), __esModule: true };

/***/ },

/***/ 35:
/***/ function(module, exports, __webpack_require__) {

var global = __webpack_require__(26);
var core = __webpack_require__(9);
var ctx = __webpack_require__(76);
var hide = __webpack_require__(79);
var has = __webpack_require__(43);
var PROTOTYPE = 'prototype';

var $export = function (type, name, source) {
  var IS_FORCED = type & $export.F;
  var IS_GLOBAL = type & $export.G;
  var IS_STATIC = type & $export.S;
  var IS_PROTO = type & $export.P;
  var IS_BIND = type & $export.B;
  var IS_WRAP = type & $export.W;
  var exports = IS_GLOBAL ? core : core[name] || (core[name] = {});
  var expProto = exports[PROTOTYPE];
  var target = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE];
  var key, own, out;
  if (IS_GLOBAL) source = name;
  for (key in source) {
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    if (own && has(exports, key)) continue;
    // export native or passed
    out = own ? target[key] : source[key];
    // prevent global pollution for namespaces
    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
    // bind timers to global for call from export context
    : IS_BIND && own ? ctx(out, global)
    // wrap global constructors for prevent change them in library
    : IS_WRAP && target[key] == out ? (function (C) {
      var F = function (a, b, c) {
        if (this instanceof C) {
          switch (arguments.length) {
            case 0: return new C();
            case 1: return new C(a);
            case 2: return new C(a, b);
          } return new C(a, b, c);
        } return C.apply(this, arguments);
      };
      F[PROTOTYPE] = C[PROTOTYPE];
      return F;
    // make static versions for prototype methods
    })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
    if (IS_PROTO) {
      (exports.virtual || (exports.virtual = {}))[key] = out;
      // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
      if (type & $export.R && expProto && !expProto[key]) hide(expProto, key, out);
    }
  }
};
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library`
module.exports = $export;


/***/ },

/***/ 368:
/***/ function(module, exports, __webpack_require__) {

__webpack_require__(189);
__webpack_require__(190);
module.exports = __webpack_require__(188);


/***/ },

/***/ 42:
/***/ function(module, exports) {

// 7.2.1 RequireObjectCoercible(argument)
module.exports = function (it) {
  if (it == undefined) throw TypeError("Can't call method on  " + it);
  return it;
};


/***/ },

/***/ 43:
/***/ function(module, exports) {

var hasOwnProperty = {}.hasOwnProperty;
module.exports = function (it, key) {
  return hasOwnProperty.call(it, key);
};


/***/ },

/***/ 44:
/***/ function(module, exports, __webpack_require__) {

// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = __webpack_require__(75);
// eslint-disable-next-line no-prototype-builtins
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
  return cof(it) == 'String' ? it.split('') : Object(it);
};


/***/ },

/***/ 45:
/***/ function(module, exports, __webpack_require__) {

// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var $keys = __webpack_require__(84);
var enumBugKeys = __webpack_require__(78);

module.exports = Object.keys || function keys(O) {
  return $keys(O, enumBugKeys);
};


/***/ },

/***/ 46:
/***/ function(module, exports) {

// 7.1.4 ToInteger
var ceil = Math.ceil;
var floor = Math.floor;
module.exports = function (it) {
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};


/***/ },

/***/ 47:
/***/ function(module, exports, __webpack_require__) {

// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = __webpack_require__(44);
var defined = __webpack_require__(42);
module.exports = function (it) {
  return IObject(defined(it));
};


/***/ },

/***/ 48:
/***/ function(module, exports, __webpack_require__) {

// 7.1.13 ToObject(argument)
var defined = __webpack_require__(42);
module.exports = function (it) {
  return Object(defined(it));
};


/***/ },

/***/ 56:
/***/ function(module, exports, __webpack_require__) {

var anObject = __webpack_require__(73);
var IE8_DOM_DEFINE = __webpack_require__(80);
var toPrimitive = __webpack_require__(92);
var dP = Object.defineProperty;

exports.f = __webpack_require__(23) ? Object.defineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if (IE8_DOM_DEFINE) try {
    return dP(O, P, Attributes);
  } catch (e) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};


/***/ },

/***/ 69:
/***/ function(module, exports, __webpack_require__) {

var core = __webpack_require__(9);
var $JSON = core.JSON || (core.JSON = { stringify: JSON.stringify });
module.exports = function stringify(it) { // eslint-disable-line no-unused-vars
  return $JSON.stringify.apply($JSON, arguments);
};


/***/ },

/***/ 70:
/***/ function(module, exports, __webpack_require__) {

__webpack_require__(94);
module.exports = __webpack_require__(9).Object.assign;


/***/ },

/***/ 71:
/***/ function(module, exports, __webpack_require__) {

__webpack_require__(95);
module.exports = __webpack_require__(9).Object.keys;


/***/ },

/***/ 72:
/***/ function(module, exports) {

module.exports = function (it) {
  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
  return it;
};


/***/ },

/***/ 73:
/***/ function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(27);
module.exports = function (it) {
  if (!isObject(it)) throw TypeError(it + ' is not an object!');
  return it;
};


/***/ },

/***/ 74:
/***/ function(module, exports, __webpack_require__) {

// false -> Array#indexOf
// true  -> Array#includes
var toIObject = __webpack_require__(47);
var toLength = __webpack_require__(91);
var toAbsoluteIndex = __webpack_require__(90);
module.exports = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIObject($this);
    var length = toLength(O.length);
    var index = toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare
      if (value != value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
      if (O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};


/***/ },

/***/ 75:
/***/ function(module, exports) {

var toString = {}.toString;

module.exports = function (it) {
  return toString.call(it).slice(8, -1);
};


/***/ },

/***/ 76:
/***/ function(module, exports, __webpack_require__) {

// optional / simple context binding
var aFunction = __webpack_require__(72);
module.exports = function (fn, that, length) {
  aFunction(fn);
  if (that === undefined) return fn;
  switch (length) {
    case 1: return function (a) {
      return fn.call(that, a);
    };
    case 2: return function (a, b) {
      return fn.call(that, a, b);
    };
    case 3: return function (a, b, c) {
      return fn.call(that, a, b, c);
    };
  }
  return function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};


/***/ },

/***/ 77:
/***/ function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(27);
var document = __webpack_require__(26).document;
// typeof document.createElement is 'object' in old IE
var is = isObject(document) && isObject(document.createElement);
module.exports = function (it) {
  return is ? document.createElement(it) : {};
};


/***/ },

/***/ 78:
/***/ function(module, exports) {

// IE 8- don't enum bug keys
module.exports = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');


/***/ },

/***/ 79:
/***/ function(module, exports, __webpack_require__) {

var dP = __webpack_require__(56);
var createDesc = __webpack_require__(87);
module.exports = __webpack_require__(23) ? function (object, key, value) {
  return dP.f(object, key, createDesc(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};


/***/ },

/***/ 80:
/***/ function(module, exports, __webpack_require__) {

module.exports = !__webpack_require__(23) && !__webpack_require__(17)(function () {
  return Object.defineProperty(__webpack_require__(77)('div'), 'a', { get: function () { return 7; } }).a != 7;
});


/***/ },

/***/ 81:
/***/ function(module, exports) {

module.exports = true;


/***/ },

/***/ 82:
/***/ function(module, exports, __webpack_require__) {

"use strict";
'use strict';
// 19.1.2.1 Object.assign(target, source, ...)
var getKeys = __webpack_require__(45);
var gOPS = __webpack_require__(83);
var pIE = __webpack_require__(85);
var toObject = __webpack_require__(48);
var IObject = __webpack_require__(44);
var $assign = Object.assign;

// should work with symbols and should have deterministic property order (V8 bug)
module.exports = !$assign || __webpack_require__(17)(function () {
  var A = {};
  var B = {};
  // eslint-disable-next-line no-undef
  var S = Symbol();
  var K = 'abcdefghijklmnopqrst';
  A[S] = 7;
  K.split('').forEach(function (k) { B[k] = k; });
  return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
}) ? function assign(target, source) { // eslint-disable-line no-unused-vars
  var T = toObject(target);
  var aLen = arguments.length;
  var index = 1;
  var getSymbols = gOPS.f;
  var isEnum = pIE.f;
  while (aLen > index) {
    var S = IObject(arguments[index++]);
    var keys = getSymbols ? getKeys(S).concat(getSymbols(S)) : getKeys(S);
    var length = keys.length;
    var j = 0;
    var key;
    while (length > j) if (isEnum.call(S, key = keys[j++])) T[key] = S[key];
  } return T;
} : $assign;


/***/ },

/***/ 83:
/***/ function(module, exports) {

exports.f = Object.getOwnPropertySymbols;


/***/ },

/***/ 84:
/***/ function(module, exports, __webpack_require__) {

var has = __webpack_require__(43);
var toIObject = __webpack_require__(47);
var arrayIndexOf = __webpack_require__(74)(false);
var IE_PROTO = __webpack_require__(88)('IE_PROTO');

module.exports = function (object, names) {
  var O = toIObject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) if (key != IE_PROTO) has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (has(O, key = names[i++])) {
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};


/***/ },

/***/ 85:
/***/ function(module, exports) {

exports.f = {}.propertyIsEnumerable;


/***/ },

/***/ 86:
/***/ function(module, exports, __webpack_require__) {

// most Object methods by ES6 should accept primitives
var $export = __webpack_require__(35);
var core = __webpack_require__(9);
var fails = __webpack_require__(17);
module.exports = function (KEY, exec) {
  var fn = (core.Object || {})[KEY] || Object[KEY];
  var exp = {};
  exp[KEY] = exec(fn);
  $export($export.S + $export.F * fails(function () { fn(1); }), 'Object', exp);
};


/***/ },

/***/ 87:
/***/ function(module, exports) {

module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};


/***/ },

/***/ 88:
/***/ function(module, exports, __webpack_require__) {

var shared = __webpack_require__(89)('keys');
var uid = __webpack_require__(93);
module.exports = function (key) {
  return shared[key] || (shared[key] = uid(key));
};


/***/ },

/***/ 89:
/***/ function(module, exports, __webpack_require__) {

var core = __webpack_require__(9);
var global = __webpack_require__(26);
var SHARED = '__core-js_shared__';
var store = global[SHARED] || (global[SHARED] = {});

(module.exports = function (key, value) {
  return store[key] || (store[key] = value !== undefined ? value : {});
})('versions', []).push({
  version: core.version,
  mode: __webpack_require__(81) ? 'pure' : 'global',
  copyright: '© 2019 Denis Pushkarev (zloirock.ru)'
});


/***/ },

/***/ 9:
/***/ function(module, exports) {

var core = module.exports = { version: '2.6.2' };
if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef


/***/ },

/***/ 90:
/***/ function(module, exports, __webpack_require__) {

var toInteger = __webpack_require__(46);
var max = Math.max;
var min = Math.min;
module.exports = function (index, length) {
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
};


/***/ },

/***/ 91:
/***/ function(module, exports, __webpack_require__) {

// 7.1.15 ToLength
var toInteger = __webpack_require__(46);
var min = Math.min;
module.exports = function (it) {
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};


/***/ },

/***/ 92:
/***/ function(module, exports, __webpack_require__) {

// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = __webpack_require__(27);
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function (it, S) {
  if (!isObject(it)) return it;
  var fn, val;
  if (S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  if (typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it))) return val;
  if (!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  throw TypeError("Can't convert object to primitive value");
};


/***/ },

/***/ 93:
/***/ function(module, exports) {

var id = 0;
var px = Math.random();
module.exports = function (key) {
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};


/***/ },

/***/ 94:
/***/ function(module, exports, __webpack_require__) {

// 19.1.3.1 Object.assign(target, source)
var $export = __webpack_require__(35);

$export($export.S + $export.F, 'Object', { assign: __webpack_require__(82) });


/***/ },

/***/ 95:
/***/ function(module, exports, __webpack_require__) {

// 19.1.2.14 Object.keys(O)
var toObject = __webpack_require__(48);
var $keys = __webpack_require__(45);

__webpack_require__(86)('keys', function () {
  return function keys(it) {
    return $keys(toObject(it));
  };
});


/***/ }

/******/ });
//# sourceMappingURL=content.js.map