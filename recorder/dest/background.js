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
/******/ 	return __webpack_require__(__webpack_require__.s = 367);
/******/ })
/************************************************************************/
/******/ ({

/***/ 367:
/***/ function(module, exports) {

"use strict";
"use strict";

(function (win) {
    var dashboard,
        currentTab,
        actions = {
        isRecording: isRecordingAction
    };

    chrome.windows.onRemoved.addListener(function (windowId) {
        if (dashboard && dashboard.id === windowId) {
            dashboard = null;
        }
    });

    chrome.browserAction.onClicked.addListener(function (tab) {
        if (!dashboard) {
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                currentTab = tabs[0];
                win.currentTab = currentTab;
                chrome.windows.create({
                    url: "index.html",
                    type: "popup",
                    width: 1150,
                    height: 750
                }, function (win) {
                    win.dashboard = dashboard;
                });
            });
        }
    });

    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (!currentTab || !sender.tab || sender.tab.id !== currentTab.id) {
            sendResponse(null);
            return;
        }

        sendResponse(actions[request.action]());
    });

    function isRecordingAction() {
        return { isRecording: win.appState && win.appState.isRecording };
    }
})(window);

/***/ }

/******/ });
//# sourceMappingURL=background.js.map