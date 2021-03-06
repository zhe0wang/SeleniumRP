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
/******/ 	return __webpack_require__(__webpack_require__.s = 122);
/******/ })
/************************************************************************/
/******/ ({

/***/ 122:
/***/ function(module, exports) {

"use strict";
'use strict';

(function () {
    start();

    function start() {
        getDiffInfo();
        initHtml();
    }

    function initHtml() {
        var previewer = document.getElementById('previewer');
        previewer.addEventListener('click', function () {
            previewer.style.display = 'none';
        });
    }

    function getDiffInfo() {
        var config = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        var request = new Request('diffInfo');

        fetch(request, config).then(function (response) {
            response.json().then(function (diffes) {
                if (!diffes.length) {
                    alert('There is no diffs to show');
                }

                createDiffList(diffes);
            });
        });
    }

    function createDiffList(diffes) {
        var app = document.getElementById('app'),
            frag = document.createDocumentFragment(),
            list = document.createElement('table'),
            listBody = document.createElement('tbody');

        list.classList.add('i-diff-list');
        diffes.forEach(function (diff) {
            var tr = document.createElement('tr'),
                title = document.createElement('div'),
                titleTd = document.createElement('td'),
                titleTr = document.createElement('tr'),
                acceptButton = createAcceptButton(diff);

            title.classList.add('i-row-title');
            title.innerHTML = diff.titleSegs.join(' > ');
            titleTd.appendChild(title);
            titleTr.appendChild(titleTd);

            tr.appendChild(createImageTd(diff.base));
            tr.appendChild(createImageTd(diff.current));
            tr.appendChild(createImageTd(diff.diff));
            tr.appendChild(acceptButton);

            listBody.appendChild(titleTr);
            listBody.appendChild(tr);
        });

        list.appendChild(listBody);
        frag.appendChild(list);
        app.innerHTML = '';
        app.appendChild(frag);
    }

    function createImageTd(src) {
        var td = document.createElement('td'),
            img = new Image();

        img.src = src;
        td.appendChild(img);

        img.addEventListener('click', function () {
            var previewerImg = document.getElementById('previewerImg');
            previewerImg.src = src;
            document.getElementById('previewer').style.display = 'block';
        });
        return td;
    }

    function createAcceptButton(diff) {
        var td = document.createElement('td'),
            button = document.createElement('input');

        button.classList.add('i-accept-btn');
        button.type = 'button';
        button.value = 'Accept';

        button.addEventListener('click', function () {
            doPostReplace(diff.file);
        });
        td.appendChild(button);
        return td;
    }

    function doPostReplace(file) {
        var config = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                file: file
            })
        };

        var request = new Request('acceptDiff');

        fetch(request, config).then(function (response) {
            getDiffInfo();
        });
    }
})();

/***/ }

/******/ });
//# sourceMappingURL=app.js.map