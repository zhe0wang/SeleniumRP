/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
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
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
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
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ({

/***/ "./content/content.js":
/*!****************************!*\
  !*** ./content/content.js ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports) {

(function () {
  var state = {
    recording: false
  },
      actions = {
    start: startAction,
    stop: stopAction,
    selecttarget: selectTargetAction,
    highlight: highlightElement,
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

    sendResponse({
      success: true
    });
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

  function highlightElement(cssPath) {
    window.automEvents.highlightElement(cssPath);
  }

  function updateConfig(config) {
    window.automEvents.updateConfig(config);
  }

  function start() {
    window.automEvents.startListening(eventCallBack);
    window.automEvents.setUpdateStateHandler(updateState);
    window.addEventListener('unload', onUnLoad);
    chrome.runtime.sendMessage({
      action: 'isRecording'
    }, function (response) {
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

    channel.postMessage({
      stopRecording: true
    });
  }

  function createChannel() {
    channel = chrome.runtime.connect({
      name: "automrecoder"
    });
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

/***/ }),

/***/ "./content/cssPathBuilder.js":
/*!***********************************!*\
  !*** ./content/cssPathBuilder.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

(function () {
  var attrsConfig,
      attrs,
      attrBuilderMap = {
    'id': buildIdPath,
    'tagName': buildTagPath,
    'classList': buildClassPath
  };

  function updateAttrsConfig(newConfig, newAttrs) {
    attrsConfig = newConfig;
    attrs = newAttrs;
  }

  function build(target) {
    var currentTarget = target,
        currentCssPath = buildCssPath(currentTarget),
        cssPath,
        els,
        nth,
        parent,
        uniqueParent,
        isUnique;

    if (isUniqueSelector(currentCssPath)) {
      return currentCssPath;
    }

    parent = currentTarget.parentNode;
    uniqueParent = getUniqueParent(parent);

    while (!isUnique && parent !== null) {
      els = parent.querySelectorAll(currentCssPath);

      if (els.length > 1) {
        nth = Array.prototype.indexOf.call(parent.children, currentTarget);

        if (nth > -1) {
          currentCssPath += ':nth-child(' + (nth + 1) + ')';
        }
      }

      if (currentCssPath !== cssPath) {
        cssPath = cssPath ? currentCssPath + ' ' + cssPath : currentCssPath;
      }

      currentTarget = parent;
      currentCssPath = buildCssPath(currentTarget);
      isUnique = isUniqueSelector(cssPath, uniqueParent.node);
      parent = currentTarget.parentNode;
    }

    return uniqueParent ? uniqueParent.cssPath + ' ' + cssPath : cssPath;
  }

  function getUniqueParent(node) {
    var parent = node.parentNode,
        cssPath = buildCssPath(node),
        isUnique = isUniqueSelector(cssPath);

    while (!isUnique && parent !== null) {
      cssPath = buildCssPath(parent);
      isUnique = isUniqueSelector(cssPath);
      node = parent;
      parent = parent.parentNode;
    }

    return {
      node: node,
      cssPath: cssPath
    };
  }

  function buildCssPath(target, parent) {
    var cssPath = '',
        pathBuilder,
        attr,
        i,
        len = attrs.length;

    for (i = 0; i < len; i += 1) {
      attr = attrs[i];

      if (!target[attr]) {
        continue;
      }

      pathBuilder = attrBuilderMap[attr] || buildAttrPath;
      cssPath = pathBuilder(target, attr, cssPath, parent);

      if (isUniqueSelector(cssPath, parent)) {
        return cssPath;
      }
    }

    return cssPath;
  }

  function buildIdPath(target, attr, cssPath, parent) {
    var id = target.id,
        attrConfig = attrsConfig[attr],
        matchValues = matches(attrConfig, [id]);

    if (!matchValues.length) {
      return cssPath;
    }

    return cssPath + '#' + matchValues[0];
  }

  function buildTagPath(target, attr, cssPath, parent) {
    var tagName = target.tagName,
        attrConfig = attrsConfig[attr],
        matchValues = matches(attrConfig, [tagName]);

    if (!matchValues.length) {
      return cssPath;
    }

    return matchValues[0] + cssPath;
  }

  function buildClassPath(target, attr, cssPath, parent) {
    var attrConfig = attrsConfig[attr],
        matchValues = matches(attrConfig, Array.prototype.slice.call(target.classList));

    if (!matchValues.length) {
      return cssPath;
    }

    matchValues.forEach(function (css) {
      cssPath += '.' + css;

      if (isUniqueSelector(cssPath, parent)) {
        return cssPath;
      }
    });
    return cssPath;
  }

  function buildAttrPath(target, attr, cssPath, parent) {
    var attrValue = target[attr],
        attrConfig = attrsConfig[attr],
        matchValues = matches(attrConfig, [attrValue]);

    if (matchValues.length) {
      cssPath += '[' + attr + '="' + matchValues[0] + '"]';
    }

    return cssPath;
  }

  function isUniqueSelector(cssPath, parent) {
    if (!cssPath) {
      return false;
    }

    parent = parent || window.document;
    return parent.querySelectorAll(cssPath).length === 1;
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
    return Object.keys(resultMap);
  }

  var cssPathBuilder = {
    updateAttrsConfig: updateAttrsConfig,
    build: build
  };
  window.automEvents = window.automEvents || {};
  window.automEvents.cssPathBuilder = cssPathBuilder;
})();

/***/ }),

/***/ "./content/eventConfig.js":
/*!********************************!*\
  !*** ./content/eventConfig.js ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports) {

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
        name: 'scroll',
        fn: function scroll(evt) {
          var target = evt.target,
              noParent = !target.parentElement,
              scrollLeft = !noParent ? target.scrollLeft : window.pageXOffset,
              scrollTop = !noParent ? target.scrollTop : window.pageYOffset;
          return {
            left: scrollLeft,
            top: scrollTop
          };
        }
      }]
    },
    contextmenu: {
      props: ['altKey', 'button', 'buttons', 'clientX', 'clientY', 'ctrlKey', 'shiftKey', 'which'] // wheel: {
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

    }
  };

  window.automEvents = window.automEvents || {};
  window.automEvents.eventConfig = events;
})();

/***/ }),

/***/ "./content/events.js":
/*!***************************!*\
  !*** ./content/events.js ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports) {

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
      Object.keys(attrsConfig).forEach(function (key) {
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
      overLay.style.position = 'absolute';
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

      overLay.style.position = 'fixed';
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

      updateState({
        key: 'selectingType',
        value: null
      });
    } else {
      isMouseDown = true;
      regionStart = {
        x: evt.clientX,
        y: evt.clientY
      };
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
    updateState({
      key: 'selectingType',
      value: null
    });
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
    setTimeout(function () {
      hideSelectingOverlay();
      selectingType = null;
      updateState({
        key: 'selectingType',
        value: null
      });
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
        message = {
      type: type
    },
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
    eventTarget.cssPath = window.automEvents.cssPathBuilder.build(target);
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
    return !elPosition ? {
      x: 0,
      y: 0
    } : {
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
    highlightElement: highlightElement,
    updateConfig: updateConfig,
    setUpdateStateHandler: setUpdateStateHandler
  };
  window.automEvents = Object.assign(window.automEvents || {}, eventModule);
})();

/***/ }),

/***/ 0:
/*!***********************************************************************************************************!*\
  !*** multi ./content/cssPathBuilder.js ./content/eventConfig.js ./content/events.js ./content/content.js ***!
  \***********************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(/*! ./content/cssPathBuilder.js */"./content/cssPathBuilder.js");
__webpack_require__(/*! ./content/eventConfig.js */"./content/eventConfig.js");
__webpack_require__(/*! ./content/events.js */"./content/events.js");
module.exports = __webpack_require__(/*! ./content/content.js */"./content/content.js");


/***/ })

/******/ });
//# sourceMappingURL=content.js.map